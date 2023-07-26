import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useAccount } from "wagmi";
import { useContractRead, useContractWrite } from "wagmi";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
const Home: NextPage = () => {
  const contractAddress = "0xFBc207C603CAab9e3091e523e5383AC7c4a680d9";
  const wagmigotchiABI = [
    {
      type: "constructor",
      name: "",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
    {
      type: "event",
      name: "Approval",
      inputs: [
        {
          type: "address",
          name: "owner",
          indexed: true,
          internalType: "address",
        },
        {
          type: "address",
          name: "spender",
          indexed: true,
          internalType: "address",
        },
        {
          type: "uint256",
          name: "value",
          indexed: false,
          internalType: "uint256",
        },
      ],
      outputs: [],
      anonymous: false,
    },
    {
      type: "event",
      name: "Transfer",
      inputs: [
        {
          type: "address",
          name: "from",
          indexed: true,
          internalType: "address",
        },
        {
          type: "address",
          name: "to",
          indexed: true,
          internalType: "address",
        },
        {
          type: "uint256",
          name: "value",
          indexed: false,
          internalType: "uint256",
        },
      ],
      outputs: [],
      anonymous: false,
    },
    {
      type: "function",
      name: "allowance",
      inputs: [
        {
          type: "address",
          name: "owner",
          internalType: "address",
        },
        {
          type: "address",
          name: "spender",
          internalType: "address",
        },
      ],
      outputs: [
        {
          type: "uint256",
          name: "",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "approve",
      inputs: [
        {
          type: "address",
          name: "spender",
          internalType: "address",
        },
        {
          type: "uint256",
          name: "amount",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          type: "bool",
          name: "",
          internalType: "bool",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "balanceOf",
      inputs: [
        {
          type: "address",
          name: "account",
          internalType: "address",
        },
      ],
      outputs: [
        {
          type: "uint256",
          name: "",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "decimals",
      inputs: [],
      outputs: [
        {
          type: "uint8",
          name: "",
          internalType: "uint8",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "decreaseAllowance",
      inputs: [
        {
          type: "address",
          name: "spender",
          internalType: "address",
        },
        {
          type: "uint256",
          name: "subtractedValue",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          type: "bool",
          name: "",
          internalType: "bool",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "deposit",
      inputs: [],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "depositTime",
      inputs: [
        {
          type: "address",
          name: "",
          internalType: "address",
        },
      ],
      outputs: [
        {
          type: "uint256",
          name: "",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "increaseAllowance",
      inputs: [
        {
          type: "address",
          name: "spender",
          internalType: "address",
        },
        {
          type: "uint256",
          name: "addedValue",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          type: "bool",
          name: "",
          internalType: "bool",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "name",
      inputs: [],
      outputs: [
        {
          type: "string",
          name: "",
          internalType: "string",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "symbol",
      inputs: [],
      outputs: [
        {
          type: "string",
          name: "",
          internalType: "string",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "totalSupply",
      inputs: [],
      outputs: [
        {
          type: "uint256",
          name: "",
          internalType: "uint256",
        },
      ],
      stateMutability: "view",
    },
    {
      type: "function",
      name: "transfer",
      inputs: [
        {
          type: "address",
          name: "to",
          internalType: "address",
        },
        {
          type: "uint256",
          name: "amount",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          type: "bool",
          name: "",
          internalType: "bool",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "transferFrom",
      inputs: [
        {
          type: "address",
          name: "from",
          internalType: "address",
        },
        {
          type: "address",
          name: "to",
          internalType: "address",
        },
        {
          type: "uint256",
          name: "amount",
          internalType: "uint256",
        },
      ],
      outputs: [
        {
          type: "bool",
          name: "",
          internalType: "bool",
        },
      ],
      stateMutability: "nonpayable",
    },
    {
      type: "function",
      name: "withdraw",
      inputs: [],
      outputs: [],
      stateMutability: "nonpayable",
    },
  ];
  const { address, isConnected } = useAccount();
  const [error, setError] = useState(null);
  const [Depositerror, setDepositError] = useState(null);

  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: contractAddress,
    abi: wagmigotchiABI,
    functionName: "deposit",
    overrides: {
      value: ethers.utils.parseEther("0.000000000000000001"),
    },
    onError(e) {
      setDepositError(e);
    },
  });
  const {
    data: withDrawData,
    isLoading: isWithDrawLoading,
    isSuccess: isWithDrawSuccess,
    write: writeWithDraw,
  } = useContractWrite({
    address: contractAddress,
    abi: wagmigotchiABI,
    functionName: "withdraw",
    onError(e: any) {
      setError(e);
    },
  });

  const { data: balance, isLoading: isBalanceLoading } = useContractRead({
    address: contractAddress,
    abi: wagmigotchiABI,
    functionName: "balanceOf",
    args: [address],
  });
  console.log("balance", balance);
  const [balanceOf, setBalanceOf] = useState();
  const getBalance = () => {
    setBalanceOf(balance.toNumber());
  };

  return (
    <div className={styles.container}>
      <ConnectButton />
      {isConnected ? (
        <div>
          <h1>{address}</h1>
          <div>
            <div>
              <button onClick={() => write()} className={styles.button}>
                Deposit
              </button>
              {isLoading && <div className={styles.card}>Check Wallet</div>}
              {isSuccess && (
                <div className={styles.card}>
                  <h5> Transaction: {JSON.stringify(data)}</h5>
                </div>
              )}
              {!isSuccess && (
                <div className={styles.card}>{Depositerror?.reason}</div>
              )}
            </div>
            <div>
              <button onClick={() => writeWithDraw()} className={styles.button}>
                withdraw
              </button>
              {isWithDrawLoading && (
                <div className={styles.card}>Check Wallet</div>
              )}
              {isWithDrawSuccess && (
                <div className={styles.card}>
                  <h5> Transaction: {JSON.stringify(withDrawData)}</h5>
                </div>
              )}
              {!isWithDrawSuccess && (
                <div className={styles.card}>{error?.reason}</div>
              )}
            </div>
            <div>
              <button className={styles.button} onClick={() => getBalance()}>Get Balance</button>
              {isBalanceLoading && <div className={styles.card}>Check Wallet</div>}
              {<div className={styles.card} >Balance: {balanceOf}</div>}
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Home;