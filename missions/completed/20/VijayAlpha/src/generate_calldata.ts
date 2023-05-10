import initAztec from "@noir-lang/aztec_backend";
import initNoir from '@noir-lang/noir_wasm';
import { acir_from_bytes } from '@noir-lang/noir_wasm';
import setup_generic_prover from "./setup_generic_prover";

export interface abi {
    x: number,
    y: number,
}

export async function generateCalldata(input: abi) {
    await initAztec("./aztec_backend_bg.wasm");
    await initNoir("./noir_wasm_bg.wasm");

    let response = await fetch('main.buf');
    let buffer = await response.arrayBuffer();
    const circuit = new Uint8Array(buffer);

    response = await fetch('acir.buf');
    buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const acir = acir_from_bytes(bytes);
    
    let [prover, ] = await setup_generic_prover(circuit);
    
    const worker = new Worker(new URL('./worker.js', import.meta.url));

    const errorPromise = new Promise((resolve, reject) => {
        worker.onerror = (e) => {
            reject(e);
        }
    });

    const resultPromise = new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
            resolve(e.data);
        }
    });

    worker.postMessage({ url: document.URL, acir, input });
    
    const witness: any = await Promise.race([errorPromise, resultPromise]);
    const proof = await prover.createProof(witness);

    return proof;
}