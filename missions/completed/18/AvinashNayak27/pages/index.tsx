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
          internalType: "uint256[2]",
          name: "a",
          type: "uint256[2]",
        },
        {
          internalType: "uint256[2][2]",
          name: "b",
          type: "uint256[2][2]",
        },
        {
          internalType: "uint256[2]",
          name: "c",
          type: "uint256[2]",
        },
        {
          internalType: "uint256[1]",
          name: "input",
          type: "uint256[1]",
        },
      ],
      name: "verifyProof",
      outputs: [
        {
          internalType: "bool",
          name: "r",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  const contractAddress = "0x6aa23d3FA200A1c443BA7E90bD92E58bec8c31f8";

  const [a, setA] = useState(["0x0", "0x0"]);
  const [b, setB] = useState([
    ["0x0", "0x0"],
    ["0x0", "0x0"],
  ]);
  const [c, setC] = useState(["0x0", "0x0"]);
  const [input, setInput] = useState(["0x0"]);

  const handleInputChange = (index: any, event: any) => {
    const { value } = event.target;
    setInput((prevInput) => {
      const newInput = [...prevInput];
      newInput[index] = value;
      return newInput;
    });
  };

  const handleAChange = (index: any, event: any) => {
    const { value } = event.target;
    setA((prevA) => {
      const newA = [...prevA];
      newA[index] = value;
      return newA;
    });
  };

  const handleBChange = (rowIndex: any, colIndex: any, event: any) => {
    const { value } = event.target;
    setB((prevB) => {
      const newB = [...prevB];
      newB[rowIndex][colIndex] = value;
      return newB;
    });
  };

  const handleCChange = (index: any, event: any) => {
    const { value } = event.target;
    setC((prevC) => {
      const newC = [...prevC];
      newC[index] = value;
      return newC;
    });
  };

  const { data } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "verifyProof",
    args: [a, b, c, input],
  });



  const handleVerification = (e: any) => {
    e.preventDefault();
    console.log(data);
  };

  return (
    <div className={styles.container}>
      <ConnectButton />
      {isConnected ? (
        <div>
          <h1>{address}</h1>
          <h2>Public input : Circuit(100)</h2>
          <form onSubmit={handleVerification}>
            <br />
            <label className={styles.label}>
              A:
              {a.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  value={value}
                  onChange={(event) => handleAChange(index, event)}
                  className={styles.input}
                />
              ))}
            </label>
            <br />
            <label className={styles.label}>
              B:
              {b.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <input
                    key={`${rowIndex}-${colIndex}`}
                    type="text"
                    value={value}
                    onChange={(event) =>
                      handleBChange(rowIndex, colIndex, event)
                    }
                    className={styles.input}
                  />
                ))
              )}
            </label>
            <br />
            <label className={styles.label}>
              C:
              {c.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  value={value}
                  onChange={(event) => handleCChange(index, event)}
                  className={styles.input}
                />
              ))}
            </label>
            <br />
            <label className={styles.label}>
              Input:
              {input.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  value={value}
                  onChange={(event) => handleInputChange(index, event)}
                  className={styles.input}
                />
              ))}
            </label>
            <button className={styles.button} type="submit">
              Submit
            </button>
          </form>

          <h1>{data ? "Proof verified" : "Proof not verified"}</h1>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Home;


