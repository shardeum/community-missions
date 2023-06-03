import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import { useAccount } from "wagmi";
import { useContractRead } from "wagmi";
import { useState } from "react";
const Home: NextPage = () => {
  const { address, isConnected } = useAccount();

  const abi = [
    {
      inputs: [
        {
          internalType: "string",
          name: "expression",
          type: "string",
        },
      ],
      name: "evaluate",
      outputs: [
        {
          internalType: "int256",
          name: "",
          type: "int256",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
  ];

  const contractAddress = "0x742BeBE0d7521B9D6A59c21B8A608853590Ce92E";

  const [amountPaid, setAmountPaid] = useState("");
  const [result, setResult] = useState(0);

  const handleAmountPaidChange = (e: any) => {
    setAmountPaid(e.target.value);
  };

  const { data } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "evaluate",
    args: [amountPaid],
  });

  const handleVerification = (e: any) => {
    e.preventDefault();
    try {
      if (!data) {
        throw new Error("Data is undefined");
      }
      const result = data.toString();
      setResult(parseInt(result));
    } catch (error) {
      console.error(error);
      alert("RPC Error. Please submit values again");
    }
  };

  return (
    <div className={styles.container}>
      <ConnectButton />
      {isConnected ? (
        <div>
          <h1>{address}</h1>
          <form onSubmit={handleVerification} className={styles.form}>
            <label>
              Enter expression:
              <input
                type="text"
                value={amountPaid}
                onChange={handleAmountPaidChange}
                className={styles.input}
              />
            </label>
            <br />

            <button className={styles.button} type="submit">
              Submit
            </button>
          </form>
          <div className={styles.card}>
            <h2>Result: {result}</h2>

          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Home;

// 2*(5+5*2)/3+(6/2+8)