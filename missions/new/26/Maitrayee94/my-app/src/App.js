import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./constants/index.js";

function App() {
  const [account, setAccount] = useState("");
  const [fstring, setFstring] = useState("");
  const [wordlist, setWordlist] = useState([]);
  const [targetString, setTargetString] = useState("");

  const connectMetamask = async (event) => {
    event.preventDefault();
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const connectContract = async (event) => {
    event.preventDefault();
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const txResponse = await contract.wordBreak(fstring, wordlist);
      setTargetString(txResponse);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(targetString);
  }, [targetString]);

  return (
    <div className="App">
      <div className="desktop-1">
      <div className="word-break-parent">
      <form className="f1">
      <p className="head">Word Break</p>
      {account ==="" ? (
      <p></p>
): account !=="" ?(
      <p className="account">Hello: {account}</p>
      ): null}
      
      <br />
        <label className="label">String:</label>
        <input type="input" className="input1" placeholder="string" value={fstring} onChange={(e) => setFstring(e.target.value)} />
        <br />
        <br />
        <label className="label">WordList:</label>
        <input type="input" className="input2" placeholder="WordList" value={wordlist} onChange={(e) => setWordlist(e.target.value.split(','))} />
        <br />
        <br />
        <br />
        <br />
        <button className="connect" onClick={connectMetamask}>
          Connect Metamask
        </button>
        <button className="button" onClick={connectContract}>
          Submit
        </button>
      </form>
      
      <br />
      {targetString.toString() === "true" ? (
  <p className="ts">The targetString can made from wordList</p>
) : targetString.toString() === "false" ? (
  <p className="ts">The targetString cannot be made from wordList</p>
) : targetString.toString() === "" ? (
  <p className="ts"></p>
) : null}

    </div>
    </div>
    </div>
  );
}

export default App;
