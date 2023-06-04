import React, { useState, useEffect } from "react";

import { ethers } from "ethers";
import {
  VALIADATE_CONTRACT_ADDRESS,
  VALIADATE_CONTRACT_ABI,
} from "./constants";

export default function Home() {
  const [targetString, setTargetString] = useState("");
  const [wordList, setWordList] = useState("");
  const [validationResult, setValidationResult] = useState("");
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);
  const [signerAddress, setSignerAddress] = useState("");
  const [isShardeumNetwork, setIsShardeumNetwork] = useState(false);

  const isInputEmpty = targetString.trim() === "" || wordList.trim() === "";

  useEffect(() => {
    // Check if the user has an Ethereum-enabled browser
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const getSignerAddress = async () => {
        const network = await provider.getNetwork();
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setSignerAddress(address);
        if (network.chainId === 8082) {
          setIsShardeumNetwork(true);
        } else {
          window.alert("change to shardeum network");
        }
      };

      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // Wallet disconnected
          setWalletConnected(false);
        }
      };

      // Subscribe to the accountsChanged event
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      // Check if the wallet is already connected
      provider.listAccounts().then(async (accounts) => {
        if (accounts.length > 0) {
          setWalletConnected(true);
          getSignerAddress();
        }
      });
    }
  }, []);

  const getSignerAddress = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const network = await provider.getNetwork();
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setSignerAddress(address);
    if (network.chainId === 8082) {
      setIsShardeumNetwork(true);
    } else {
      window.alert("change to shardeum network");
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoadingB(true);
      await window.ethereum.enable();
      setWalletConnected(true);
      await getSignerAddress();
      setIsLoadingB(false);
    } catch (error) {
      console.log(error);
    }
  };

  async function validateString() {
    try {
      setIsLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Create an instance of the contract
      const contract = new ethers.Contract(
        VALIADATE_CONTRACT_ADDRESS,
        VALIADATE_CONTRACT_ABI,
        signer
      );

      // Call the validate function
      let validation;
      if (isCaseSensitive) {
        validation = await contract.canFormTargetWordCaseSensitive(
          targetString,
          wordList.split(",")
        );
      } else {
        validation = await contract.canFormTargetWordIgnoreCase(
          targetString,
          wordList.split(",")
        );
      }

      // Set the validation result
      setValidationResult(validation);
    } catch (error) {
      const er =
        "Sorry, input valid parameters and make sure you are connected to the right Network";
      setValidationResult(er);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <div className="flex justify-end m-0 p-0">
          <button
            onClick={connectWallet}
            className="bg-white hover:bg-blue-200 text-gray font-bold py-2 px-4 mt-5 mr-4 rounded"
          >
            {isLoadingB ? "connecting..." : "connect wallet"}
          </button>
        </div>
      );
    }

    if (walletConnected) {
      return (
        <div className="flex justify-end m-0 p-0">
          <button className="bg-white hover:bg-blue-200 text-gray font-bold py-2 px-4 mt-5 mr-4 rounded">
            {signerAddress.substring(0, 4)}...
            {signerAddress.substring(signerAddress.length - 4)}
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-500 py-4">
        <div className="container mx-auto">
          <h1 className="text-white text-3xl font-bold">Welcome</h1>
          {renderButton()}
        </div>
      </header>

      <div className="container mx-auto px-4 h-screen">
        <h1 className="text-3xl font-bold mb-4">Word Mix Validator</h1>
        {isShardeumNetwork && walletConnected ? (
          <div className="flex flex-col justify-center items-center">
            <div className="mb-4">
              <label className="block font-bold mb-2">Target String:</label>
              <input
                type="text"
                className="border border-gray-300 p-2 outline-none rounded"
                value={targetString}
                onChange={(e) => setTargetString(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">
                Word List (comma-separated):
              </label>
              <input
                type="text"
                className="border border-gray-300 p-2 outline-none rounded"
                value={wordList}
                onChange={(e) => setWordList(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block font-bold mb-2">Validation Type:</label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isCaseSensitive}
                  onChange={(e) => setIsCaseSensitive(e.target.checked)}
                />
                <span className="ml-2">Case-Sensitive</span>
              </label>
            </div>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={validateString}
              disabled={isLoading || isInputEmpty}
            >
              {isLoading ? "Validating..." : "Validate"}
            </button>

            {validationResult !== "" && (
              <p className="mt-4">
                Validation Result: {validationResult.toString()}
              </p>
            )}
          </div>
        ) : (
          <p>
            Once your wallet is connected, Please switch to the shardeum sphinx
            1.X network to access the validator
          </p>
        )}
      </div>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Martonyx. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
