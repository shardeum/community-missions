import logo from "./logo.svg";
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import React, { useState, useEffect } from "react";
import abi from "./abi.json";
import "./App.css";

const CONTRACT_ADDRESS = "0x05Fa261e5289b033c435475f7F5Fae9309fd04b9";
const providers = new ethers.providers.Web3Provider(window.ethereum);
// Create signer and contract instances
const signers = providers.getSigner();

function App() {
  const [str, setStr] = useState("");
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);
  async function connectWallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) { // Assuming Sepolia network has chainId 31337
          const chainData = {
            chainId: '0xaa36a7', // Sepolia chainId in hexadecimal format
            chainName: 'Sepolia Network',
            nativeCurrency: {
              name: 'Sepolia',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: ['https://rpc2.sepolia.org'], // Replace with the actual RPC URL for Sepolia network
            blockExplorerUrls: ['https://sepolia.etherscan.io'], // Replace with the actual block explorer URL for Sepolia network
          };
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainData],
          });
          return;
        }
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setMessage('Connected to wallet');
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setMessage('Please install MetaMask.');
    }
  }
  

  async function evaluateExpression() {
    setMessage("");
    const evac = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signers);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    if (network.chainId !==11155111) { // Assuming Sepolia network has chainId 31337
      setMessage("Wrong Network. Please switch to Sepolia network.");
      connectWallet();
      setMessage("");
      return;
    }
    const result = await evac.connect(signers).eval(str);
    const results = await result[0];
    setMessage(`Evaluate: ${parseInt(await results._hex, 16)}`);
  }
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="flex flex-col items-center justify-center">
        <img src={logo} className="w-24 h-24 animate-spin" alt="logo" />
        <h1 className="text-3xl font-bold">Contract Interact</h1>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
        {walletAddress && (
          <p className="mt-2 text-gray-600">Wallet Address: {walletAddress}</p>
        )}
        <div className="flex items-center mt-4">
          <input
            className="rounded-l px-4 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 flex-grow"
            type="text"
            value={str}
            onChange={(e) => setStr(e.target.value)}
            placeholder="Enter expression"
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
            onClick={evaluateExpression}
          >
            Evaluate
          </button>
        </div>
        {message && <p className="mt-4 text-gray-600">{message}</p>}
      </header>
    </div>
  );
  
}

export default App;
