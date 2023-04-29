import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import {
  useContract,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import config from "../contractconfig.json";
import { useConnect, useAccount, useNetwork } from "wagmi";
import { useIsMounted } from "../hooks/useIsMounted";
import u from "../hooks/u";

export default function Home() {
  const { chain } = useNetwork();
  console.log("chain", chain);
  const addresslist = {
    8081: "0x72eDc924734c8cc1B778F2aee67D6c6DF5d6E077",
    8082: "0xdA211A814F0025ecd16d7c4e6E4968a20d476691",
  };
  let address1 = "0xdA211A814F0025ecd16d7c4e6E4968a20d476691";
  if (chain) {
    address1 = addresslist[chain["id"]];
  }
  // @ts-ignore

  const { address, isConnecting, isDisconnected } = useAccount();
  const mounted = useIsMounted();
  const [data1, setData] = useState(null);
  const { connector: activeConnector, isConnected } = useAccount();

  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [proof, setProof] = useState(["proof"]);
  const [showProof, setShowProof] = useState(false);
  const [Proofverify, setProofVerify] = useState(false);
  const [loader, setloader] = useState(false);

  const { data, isError, isLoading } = useContractRead({
    // @ts-ignore
    address: address1,
    abi: config.abi,
    functionName: "verifyProof",
    args: [proof[0], proof[1], proof[2], proof[3]],
    enabled: showProof,
    onSuccess(data) {
      // @ts-ignore
      setloader(false);
      // @ts-ignore
      setProofVerify(data);

      console.log("Success", data);
    },
  });
  async function generate_proof() {
    const SnarkJS = window["snarkjs"];
    setloader(true);
    if (input1 === "" || input2 === "") {
      return alert("input filed required to generate proof");
    }
    const { proof, publicSignals } = await SnarkJS.groth16.fullProve(
      {
        x: input1,
        y: input2,
      },
      "/circuit.wasm",
      "/setup_final.zkey"
    );
    const callInputs = [
      proof.pi_a.slice(0, 2).map(u.BN256ToHex),
      proof.pi_b
        .slice(0, 2)
        .map((row) => u.reverseCoordinate(row.map(u.BN256ToHex))),
      proof.pi_c.slice(0, 2).map(u.BN256ToHex),
      publicSignals.slice(0, 2).map(u.BN256ToHex),
    ];
    // @ts-ignore
    setProof(callInputs);
    setShowProof(true);
  }
  const handleinput1 = (event) => {
    setInput1(event.target.value);
    setProofVerify(false);
    setShowProof(false);
  };
  const handleinput2 = (event) => {
    setInput2(event.target.value);
    setProofVerify(false);
    setShowProof(false);
  };
  return (
    <div>
      <div className="flex justify-end">
        <ConnectButton showBalance={false} />
      </div>
      {mounted && isConnected ? (
        <div className="flex justify-center">
          <div className="flex flex-col space-y-4 border border-black p-4 rounded-lg">
            <div>
              <label htmlFor="input1" className="text-gray-700 font-bold">
                Input x:
              </label>
              <input
                id="input1"
                name="input1"
                type="number"
                className="border-gray-400 border-2 p-2 w-full rounded-lg"
                value={input1}
                onChange={handleinput1}
              />
            </div>
            <div>
              <label htmlFor="input2" className="text-gray-700 font-bold">
                Input y:
              </label>
              <input
                id="input2"
                name="input2"
                type="numberw"
                className="border-gray-400 border-2 p-2 w-full rounded-lg"
                value={input2}
                onChange={handleinput2}
              />
            </div>
            <div>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={generate_proof}
              >
                Generate Proof and verify
              </button>
            </div>
            {showProof && (
              <div>
                <label htmlFor="proof" className="text-gray-700 font-bold">
                  Proof:
                </label>
                <textarea
                  id="proof"
                  name="proof"
                  className="border-gray-400 border-2 p-2 w-full rounded-lg h-64"
                  value={JSON.stringify(proof, null, 1).slice(1, -1)}
                  readOnly
                ></textarea>
                <div className="flex justify-center mt-4"></div>
              </div>
            )}
          </div>
          {(Proofverify && (
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-green-100">
                <svg
                  className="w-4 h-4 text-green-500 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
              </div>
              <p className="text-green-500 font-medium">Proof verified</p>
            </div>
          )) ||
            (loader && (
              <div className="flex items-center">
                <div className="w-6 h-6 border-4 border-blue-500 rounded-full animate-spin"></div>
                <div className="ml-3 text-gray-700">Verifying...</div>
              </div>
            ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-gray-600">
              Please connect your wallet to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
