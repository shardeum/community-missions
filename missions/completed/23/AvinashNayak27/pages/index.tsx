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
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amountDue",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountPaid",
          "type": "uint256"
        }
      ],
      "name": "changeReturn",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ];
  const contractAddress = "0xeb2b5450AbeC611B7B696bcE82f63d3A8d19DcF8";

  const [amountDue, setAmountDue] = useState();
  const [amountPaid, setAmountPaid] = useState();
  const [coins, setcoins] = useState([])

  const handleAmountDueChange = (e: any) => {
    setAmountDue(e.target.value);
  };

  const handleAmountPaidChange = (e: any) => {
    setAmountPaid(e.target.value);
  };





  const { data } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "changeReturn",
    args: [amountDue, amountPaid],
  });



  const handleVerification = (e: any) => {
    e.preventDefault();
    try {
      if (!data) {
        throw new Error('Data is undefined');
      }
      const dataInt = data.map((x: any) => parseInt(x._hex, 16));
      console.log(dataInt);
      setcoins(dataInt);
    } catch (error) {
      console.error(error);
      alert("RPC Error. Please submit values again");
    }
  };

  function getCoinName(index: number) {
    switch (index) {
      case 0:
        return "quarters (25 cents)";
      case 1:
        return "dimes (10 cents)";
      case 2:
        return "nickels (5 cents)";
      case 3:
        return "pennies (1 cent)";
      default:
        return "";
    }
  }


  return (
    <div className={styles.container}>
      <ConnectButton />
      {isConnected ? (
        <div>
          <h1>{address}</h1>
          <form onSubmit={handleVerification} className={styles.form}>
            <br />
            <label>
              Amount Due:
              <input
                type="number"
                value={amountDue}
                onChange={handleAmountDueChange}
              />
            </label>
            <br />
            <label>
              Amount Paid:
              <input

                type="number"
                value={amountPaid}
                onChange={handleAmountPaidChange}
              />
            </label>
            <br />

            <button className={styles.button} type="submit">
              Submit
            </button>
          </form>
          <div className={styles.card}>
            {coins.map((coin: any, index: number) => (
              <div key={index} className={styles.key}>
                {getCoinName(index)}: {coin}
              </div>
            ))}
          </div>



        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Home;


