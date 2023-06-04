import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import {
  useContract,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import config from "../contractconfig.json";
import { useConnect, useAccount } from "wagmi";
import { useIsMounted } from "../hooks/useIsMounted";
import { CreateImage } from "../components/createImage";
export default function Home() {
  const address1 = "0xC582fc2aD1643e0D8dd99e1514A8281218E5218B";
  const mounted = useIsMounted();
  const { connector: activeConnector, isConnected } = useAccount();
  const [inputArray, setInputArray] = useState([]);
  const [inputString, setInputString] = useState("");
  const [datastatus, setdataStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const handlestring = (event) => {
    setInputString(event.target.value);
  };
  const handlestring2 = (event) => {
    const inputString = event.target.value;
    const stringArray = inputString.split(",");
    setInputArray(stringArray);
  };

  const { data, isError, isLoading } = useContractRead({
    address: address1,
    abi: config.abi,
    functionName: "validate",
    args: [inputString, inputArray],
    enabled: datastatus,
    onSuccess(data) {
      setdataStatus(false);
      alert(data);
      setLoading(false);
    },
  });

  const handleButtonAdmin = () => {
    // Do something with the input value
    setLoading(true);
    setdataStatus(true);
  };

  return (
    <div className="relative z-10">
      <div className="flex justify-end">
        <ConnectButton showBalance={false} />
      </div>
      {mounted && isConnected ? (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-500">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
              <label
                htmlFor="expression"
                className="block text-lg font-medium mb-2 text-black"
              >
                Enter string:
              </label>
              <input
                type="text"
                id="expression"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                onChange={handlestring}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="expression"
                className="block text-lg font-medium mb-2 text-black"
              >
                Enter string List:
              </label>
              <input
                type="text"
                id="expression"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                onChange={handlestring2}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
              onClick={handleButtonAdmin}
            >
              Submit
            </button>
          </div>
          {loading && (
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gray-900"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-white">
              Connect Your Wallet
            </h1>
            <p className="text-white">
              Please connect your wallet to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
