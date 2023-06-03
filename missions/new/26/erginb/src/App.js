import React, { useState } from 'react';
import Web3 from 'web3';
import './App.css'
import detectEthereumProvider from '@metamask/detect-provider';



function App() {
  const [account, setAccount] = useState('');
  const [targetString, setTargetString] = useState('');
  const [wordList, setWordList] = useState('');

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS
  const ABI = [
			{
				"inputs": [
					{
						"internalType": "string",
						"name": "targetString",
						"type": "string"
					},
					{
						"internalType": "string[]",
						"name": "wordList",
						"type": "string[]"
					}
				],
				"name": "validate",
				"outputs": [
					{
						"internalType": "bool",
						"name": "",
						"type": "bool"
					}
				],
				"stateMutability": "pure",
				"type": "function"
			}
		]

  // useEffect(() => {
  //   if(window.ethereum) {
  //     window.ethereum.on('chainChanged', () => {
  //       window.location.reload();
  //     })
  //     window.ethereum.on('accountsChanged', () => {
  //       window.location.reload();
  //     })
  //   }
  // })

  async function connectMetamask() {
    // let ethereum;
    // ethereum = await detectEthereumProvider();
    // var result = await ethereum.request({ method: 'eth_requestAccounts' });

    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if(chainId != 8082){
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: "0x1F92" }]
        })
      }
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const ID = await web3.eth.net.getId();
      console.log({ID})
    } else {
      alert('Please install MetaMask to use this dApp!');
    }
  }

  async function validateWords() {
    // Instantiate the contract with the ABI and address
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(ABI, contractAddress);

    // Call the validate function
    const result = await contract.methods.validate(targetString, wordList.split(',')).call({ from: account });

    // Display the result
    alert(result ? 'Valid word combination' : 'Invalid word combination');
  }

  return (
    <div className="card">
      <button onClick={connectMetamask}>Connect Metamask</button>
      <p>Account: {account.slice(0,4)}...{account.slice(38)}</p>
      <div>

    <label className="input">
        <input
        className="input__field"
          type="text"
          placeholder="Target string"
          value={targetString}
          onChange={(e) => setTargetString(e.target.value)}
          style={{marginBottom: "10px"}}
        />
        </label>
        <label className="input">
        <input
        className="input__field"
          type="text"
          placeholder="Word list (comma-separated)"
          value={wordList}
          onChange={(e) => setWordList(e.target.value)}
          style={{marginBottom: "10px"}}
        />
        </label>
      </div>
      <button onClick={validateWords}>Validate</button>
    </div>
  );
}

export default App;