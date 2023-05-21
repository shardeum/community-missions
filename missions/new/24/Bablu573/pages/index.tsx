import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import Head from "next/head";
import { useContractRead } from "wagmi";
import { useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

const Home: NextPage = () => {
  const { address, isConnected } = useAccount();

  const abi = [
    {
      inputs: [],
      name: "getWater",
      outputs: [
        {
          internalType: "uint8[4][3]",
          name: "",
          type: "uint8[4][3]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "resetWater",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "spiralClockwise",
      outputs: [
        {
          internalType: "uint256[12]",
          name: "",
          type: "uint256[12]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "spiralCounterClockwise",
      outputs: [
        {
          internalType: "uint256[12]",
          name: "",
          type: "uint256[12]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "unspiralClockwise",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "unspiralCounterClockwise",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "useSpiral",
      outputs: [
        {
          internalType: "uint256[12]",
          name: "",
          type: "uint256[12]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "useSpiralCounter",
      outputs: [
        {
          internalType: "uint256[12]",
          name: "",
          type: "uint256[12]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "water",
      outputs: [
        {
          internalType: "uint8",
          name: "",
          type: "uint8",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  const contractAddress = "0x1567CaD188aeaDe34C8892F0B54fde90137d2fE9";

  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: "unspiralClockwise",
  });
  const { write, isLoading, isSuccess, data } = useContractWrite({
    ...config,
    onSuccess(data) {
      console.log("Success", data);
    },
  });

  const { config: config1 } = usePrepareContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: "unspiralCounterClockwise",
  });
  const {
    write: write1,
    isLoading: isloading1,
    isSuccess: isSuccess1,
    data: data1,
  } = useContractWrite({
    ...config1,
    onSuccess(data1) {
      console.log("Success", data1);
    },
  });
  const { config: config2 } = usePrepareContractWrite({
    address: contractAddress,
    abi: abi,
    functionName: "resetWater",
  });
  const {
    write: write2,
    isLoading: isloading2,
    isSuccess: isSuccess2,
    data: data2,
  } = useContractWrite({
    ...config2,
    onSuccess(data2) {
      console.log("Success", data2);
    },
  });

  const { data: water } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "getWater",
    watch: true,
  });
  console.log(water);

  return (
    <div className="flex flex-col items-center justify-center  bg-green-100 min-h-screen">
      <Head>
        <title>SHM MISSION 24</title>
        <meta
          content="Developed by @bablu573 for the SHM MISSION 24"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <main className="flex flex-col items-center py-2 bg-green-100 mt-20">
        <ConnectButton />
        {isConnected && (
          <>
            <h3 className="text-3xl font-bold mt-4 text-yellow-600">
              SHM MISSION 24
            </h3>
            <div className="w-3/4 bg-yellow-100 rounded-lg shadow-lg mt-4 p-4 grid grid-cols-4 gap-4 overflow-hidden">
              {water?.map((row, i) =>
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="border-4 border-yellow-200 text-center bg-green-500 h-16 w-12 text-white font-bold align-middle rounded-lg mr-4 flex justify-center items-center"
                  >
                    {cell}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-center items-center mt-4">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                disabled={!write}
                onClick={() => write?.()}
              >
                Spiral Clockwise
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 ml-10"
                disabled={!write1}
                onClick={() => write1?.()}
              >
                Spiral counter Clockwise
              </button>

              {(isLoading || isloading1) && (
                <div className="ml-4 text-lg text-yellow">Check Wallet</div>
              )}
            </div>
            <div className="flex justify-center items-center mt-4">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                disabled={!write2}
                onClick={() => write2?.()}
              >
                Reset Water
              </button>
              {isloading2 && (
                <div className="ml-4 text-lg text-yellow">Check Wallet</div>
              )}
            </div>
          </>
        )}
      </main>
      <footer className="grid items-center justify-center w-full h-36 border-t bg-green-100 mt-40">
        <a
          className="flex items-center justify-center"
          href="
          https://sepolia.etherscan.io/address/0x1567CaD188aeaDe34C8892F0B54fde90137d2fE9"
          rel="noopener noreferrer"
          target="_blank"
        >
          Etherscan
        </a>
        <a
          className="flex items-center justify-center"
          href="
          https://github.com/bablu573"
          rel="noopener noreferrer"
          target="_blank"
        >
          Developed by @bablu573
        </a>
      </footer>
    </div>
  );
};

export default Home;
