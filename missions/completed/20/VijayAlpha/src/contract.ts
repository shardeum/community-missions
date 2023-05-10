import { ethers } from "ethers";
import address from './artifacts/address.json';
import Verifier from './artifacts/TurboVerifier.json';
import { generateCalldata, abi } from './generate_calldata';

let verifier: ethers.Contract;

export async function connectContract() {
    const { ethereum } = window;

    let provider = new ethers.providers.Web3Provider(ethereum);
    let signer = provider.getSigner();
    console.log('signer: ', await signer.getAddress());

    verifier = new ethers.Contract(address['TurboVerifier'], Verifier.abi, signer);

    console.log("Connect to Verifier Contract:", Verifier);
}

export async function verifyProof(input: abi) {

    await connectContract();

    let calldata = await generateCalldata(input);

    if (calldata) {
        let valid = await verifier.verify(calldata);
        if (valid) {
            // console.log("Proof verified");
            return true;
        }
        else {
            throw new Error("Invalid proof.");
        }
    }
    else {
        throw new Error("Calldata generation failed.");
    }
}