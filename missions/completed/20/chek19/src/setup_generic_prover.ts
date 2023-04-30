import { Crs } from '@noir-lang/barretenberg/dest/crs';
import { PooledFft } from '@noir-lang/barretenberg/dest/fft';
import { PooledPippenger } from '@noir-lang/barretenberg/dest/pippenger';
import { BarretenbergWasm, WorkerPool } from '@noir-lang/barretenberg/dest/wasm';
import { Prover } from '@noir-lang/barretenberg/dest/client_proofs/prover';

const circSize = 16;
const numWorkers = 4;


async function load_crs(circSize: number) {
    // We may need more elements in the SRS than the circuit size. In particular, we may need circSize +1
    // We add an offset here to account for that
    const offset = 1;

    const crs = new Crs(circSize + offset);
    await crs.download();

    return crs;
}

export default async function setup_generic_prover(serialised_circuit: any) {

    const crs = await load_crs(circSize);
    
    const wasm = await BarretenbergWasm.new();
    const workerPool = await WorkerPool.new(wasm, numWorkers);
    const pippenger = new PooledPippenger(workerPool);

    const fft = new PooledFft(workerPool);
    await fft.init(circSize);

    await pippenger.init(crs.getData());

    const prover = new Prover(workerPool.workers[0], pippenger, fft);

    const standardExampleProver = new StandardExampleProver(prover);
    await standardExampleProver.initCircuitDefinition(serialised_circuit);

    // Create proving key with a dummy CRS
    await standardExampleProver.computeKey();

    return Promise.all([standardExampleProver]);
}

class StandardExampleProver {
  constructor(private prover: Prover) {}

  // We do not pass in a constraint_system to this method
  // so that users cannot call it twice and possibly be
  // in a state where they have a different circuit definition to
  // the proving key
  //
  //Ideally, we want this to be called in the constructor and not be manually called by users. Possibly create a .new method
  public async initCircuitDefinition(constraint_system: Uint8Array) {
    let worker = this.prover.getWorker();
    const constraint_system_ptr = await worker.call('bbmalloc', constraint_system.length);
    await worker.transferToHeap(constraint_system, constraint_system_ptr);

    await worker.call('standard_example__init_circuit_def', constraint_system_ptr);
  }

  public async computeKey() {
    const worker = this.prover.getWorker();
    await worker.call('standard_example__init_proving_key');
  }

  public async createProof(witness_arr: Uint8Array) {
    const worker = this.prover.getWorker();

    const witness_ptr = await worker.call('bbmalloc', witness_arr.length);
    await worker.transferToHeap(witness_arr, witness_ptr);

    const proverPtr = await worker.call('standard_example__new_prover', witness_ptr);
    const proof = await this.prover.createProof(proverPtr);
    await worker.call('standard_example__delete_prover', proverPtr);
    return proof;
  }

  public getProver() {
    return this.prover;
  }
}