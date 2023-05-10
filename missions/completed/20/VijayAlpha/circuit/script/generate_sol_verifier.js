import { resolve, join } from "path";
import { compile } from "@noir-lang/noir_wasm";
import { setup_generic_prover_and_verifier } from "@noir-lang/barretenberg/dest/client_proofs";
import { writeFileSync } from "fs";

async function generate_sol_verifier() {
  let compiled_program = compile(resolve(__dirname, "../src/main.nr"));
  const acir = compiled_program.circuit;

  let [_, verifier] = await setup_generic_prover_and_verifier(acir);

  const sc = verifier.SmartContract();
  syncWriteFile("../contracts/plonk_vk.sol", sc);

  console.log("done writing sol verifier");
}

function syncWriteFile(filename, data) {
  writeFileSync(join(__dirname, filename), data, {
    flag: "w",
  });
}

generate_sol_verifier()
  .then(() => process.exit(0))
  .catch(console.log);
