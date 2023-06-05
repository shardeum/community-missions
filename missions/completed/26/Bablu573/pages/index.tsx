import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import Head from "next/head";
import { useContractRead } from "wagmi";
import { useState } from "react";

const Home: NextPage = () => {
  const {  isConnected } = useAccount();

  const abi = [
    {
      inputs: [
        {
          internalType: "string",
          name: "s",
          type: "string",
        },
        {
          internalType: "string[]",
          name: "wordDict",
          type: "string[]",
        },
      ],
      name: "validate",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
  ];
  const contractAddress = "0xdB75D1a2879c14092615452A914a088448d06FCe";
  const [string, setstring] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [array, setArray] = useState([]);

  const handleInputChange = (event:any) => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = () => {
    if (inputValue.trim() !== "") {
      setArray((prevArray) => [...prevArray, inputValue]);
      setInputValue("");
    }
  };
  const clearDict = ()=>{
    setArray([])
  }

  const handleStringChange = (e: any) => {
    setstring(e.target.value);
  };
  console.log(string);
  const { data } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "validate",
    args: [string, array],
  });
  const [isvalidated, setisvalidated] = useState(false)
  console.log(data);
  const handleSubmit = () => {
    setisvalidated(data)
  }

  return (
    <div className="flex flex-col items-center justify-center  bg-green-100 min-h-screen">
      <Head>
        <title>SHM MISSION 26</title>
        <meta
          content="Developed by @bablu573 for the SHM MISSION 26"
          name="description"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>
      <main className="flex flex-col items-center py-2 bg-green-100 mt-20">
        <ConnectButton />
        {isConnected && (
          <>
            <h3 className="text-3xl font-bold mt-4 text-yellow-600">
              SHM MISSION 26
            </h3>
            <div>
              <div className="flex mt-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Enter word dict"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleButtonClick}
                  className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 ml-5"
                >
                  Add
                </button>
                <button
                  onClick={clearDict}
                  className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 ml-5"
                >
                  Reset
                </button>
              </div>
              <div className="flex">
                {array.map((item, index) => (
                  <div key={index} className="bg-blue-500 text-white p-4 mb-2 mt-4 ml-4 rounded-3xl">
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex mt-4">
                <input
                  type="text"
                  value={string}
                  onChange={handleStringChange}
                  placeholder="Enter string"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 ml-5"
                >
                  validate
                </button>
              </div>
            </div>
            <div className="mt-6 font-bold">
            {isvalidated ? "validated String can be segmented" :"is not validated String cannot be segmented"}
            </div>
          </>
        )}
      </main>
      <footer className="grid items-center justify-center w-full h-36 border-t bg-green-100 mt-40">
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
