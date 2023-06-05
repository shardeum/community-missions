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
import * as React from "react";
export default function Home() {
  const address1 = "0x2B5c65CcBf32eC3C6158d66AF3bCBBf0f86c5daF";
  const mounted = useIsMounted();
  const { connector: activeConnector, isConnected } = useAccount();
  const [inputadmin, setInputAdmin] = useState("");
  const [adminstatus, setAdminStatus] = React.useState(false);
  const [output, setOutput] = useState<string | undefined>("initial value");
  const handleInputChange = (event) => {
    setInputAdmin(event.target.value);
  };
  const { data, isError, isLoading } = useContractRead({
    address: address1,
    abi: config.abi,
    functionName: "computeStringExpression",
    args: [inputadmin],
    enabled: adminstatus,
    onSuccess(data) {
      setAdminStatus(false);
      console.log(data);
    },
  });

  const handleButtonAdmin = () => {
    // Do something with the input value
    setAdminStatus(true);
    console.log("Input value:", inputadmin);
  };
  return (
    <div className="relative">
      <div className="fixed inset-0 overflow-hidden z-0">
        <video
          className="object-cover w-full h-full"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/videos/demo.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="relative z-10">
        <div className="flex justify-end">
          <ConnectButton showBalance={false} />
        </div>
        {mounted && isConnected ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="max-w-md p-6 bg-gray-100 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold mb-4 text-center">
                Calculator
              </h1>
              <div className="mb-4">
                <label htmlFor="address" className="block font-medium mb-2">
                  Enter string expression:
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  onChange={handleInputChange}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                onClick={handleButtonAdmin}
              >
                Submit
              </button>
              {data ? (
                <div className="bg-blue-500 text-white p-4">
                  result:{parseInt(data["_hex"], 16)}
                </div>
              ) : (
                <></>
              )}
            </div>
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
    </div>
  );
}
