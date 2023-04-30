import { ZoKratesProvider, initialize } from "zokrates-js";
import { Web3Provider } from "@ethersproject/providers";
import proof from "./proof.json"
import Web3 from "web3";
import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";
import "./App.css";

// Replace CONTRACT_ADDRESS with the actual address of your contract
const CONTRACT_ADDRESS = "0xE84BAf6e4D204282f7b47444dA69d0200fe97CD5";

function GuessTheNumber() {
  const [number, setNumber] = useState(10);
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [contract, setContract] = useState(null);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected to wallet!");
        setMessage("Connected to wallet");
      } catch (error) {
        console.error(error);
      }
    } else {
      setMessage("Please install MetaMask.");
    }
  }

  async function handleGuessSubmit(event) {
    event.preventDefault();

    const parsedGuess = parseInt(guess);
    console.log(parsedGuess);
    if (isNaN(parsedGuess)) {
      setMessage("Please enter a valid number.");
    } else {
      if (parsedGuess == number) {
        setMessage("correct guess");
      } else {
        setMessage("incorrect guess");
      }
    }

    // setGuess("");
  }

  function handleGuessChange(event) {
    setGuess(event.target.value);
  }

  async function handleProofVerify() {
    if (true) {
      const web3 = new Web3(
        "https://liberty20.shardeum.org/?_ga=2.136350512.1845892274.1681899570-941311559.1678303385&_gl=1*i51qxl*_ga*OTQxMzExNTU5LjE2NzgzMDMzODU.*_ga_2VJLR99VYW*MTY4MTkyNjU3NC4xMS4wLjE2ODE5MjY1NzQuMC4wLjA."
      );
      const accounts = await web3.eth.getAccounts();
      const address = "0x1b0A55beEAAB8fD744e706130367Cd50D7a3b8A3"; // verifier contract address
      let verifier = new web3.eth.Contract(abi.abi, address, {
        from: accounts[0], // default from address
        gasPrice: "20000000000000", // default gas price in wei
      });

      proof.inputs[0] = guess.toString(16)
      let result = await verifier.methods
        .verifyTx(proof.proof, proof.inputs)
        .call({ from: accounts[0] });
      setMessage(`result:${result}`);
      console.log(result);
    } else {
      setMessage("Verification unsuccessful");
    }
    console.log(proof.inputs);
  }

  async function handleProofVerifys() {
     setMessage(10)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={connectWallet}
        className="absolute top-0 right-0 m-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Connect Wallet
      </button>
      <h1 className="text-4xl font-bold mb-4">Guess the Number</h1>
      <p className="mb-2">Guess a number between 1 and 100:</p>
      <form onSubmit={handleGuessSubmit} className="flex items-center">
        <input
          type="text"
          value={guess}
          onChange={handleGuessChange}
          className="border border-gray-300 rounded-lg py-2 px-4 mr-2 w-24 text-center"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Guess
        </button>
        <button
          type="button"
          onClick={handleProofVerifys}
          className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          show answer
        </button>
        <button
          type="button"
          onClick={handleProofVerify}
          className="ml-4 bg-green-500 hover:bg-black-700 text-white font-bold py-2 px-4 rounded"
        >
          Verify 
        </button>
      </form>
      <p className="mt-4 text-center">{message}</p>
      {walletAddress && (
        <p className="mt-4 text-center">Connected wallet: {walletAddress}</p>
      )}
    </div>
  );
}

export default GuessTheNumber;
