import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import { useState,useEffect } from 'react'
import clsx from 'clsx';
import { ethers } from "ethers";
import Web3 from 'web3';

const abi = [
  {
      "inputs": [],
      "name": "resetWin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint8[9][9]",
              "name": "newBoard",
              "type": "uint8[9][9]"
          }
      ],
      "name": "verifyWin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "name": "didThePlayerWin",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "emptyCount",
      "outputs": [
          {
              "internalType": "uint8",
              "name": "",
              "type": "uint8"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "getBoard",
      "outputs": [
          {
              "internalType": "uint8[9][9]",
              "name": "",
              "type": "uint8[9][9]"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint8",
              "name": "row",
              "type": "uint8"
          },
          {
              "internalType": "uint8",
              "name": "col",
              "type": "uint8"
          },
          {
              "internalType": "uint8",
              "name": "num",
              "type": "uint8"
          },
          {
              "internalType": "uint8[9][9]",
              "name": "newBoard",
              "type": "uint8[9][9]"
          }
      ],
      "name": "isValidSudoku",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "originalBoard",
      "outputs": [
          {
              "internalType": "uint8",
              "name": "",
              "type": "uint8"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  }
];
const contractAddress = "0x9ABe3aef19786cB70F7FF01D545e35D29569d0Ba"

// Define the initial Sudoku board as a 2D array of numbers
const initialBoard = [[7, 8, 5, 1, 4, 3, 9, 2, 6],
[6, 1, 2, 8, 7, 9, 4, 3, 5],
[4, 9, 3, 6, 2, 5, 7, 1, 8],
[8, 5, 7, 4, 1, 2, 6, 9, 3],
[2, 3, 1, 9, 6, 7, 8, 5, 4],
[9, 4, 6, 3, 5, 8, 1, 7, 2],
[5, 7, 8, 2, 3, 1, 6, 4, 9],
[1, 2, 4, 5, 9, 0, 3, 8, 7],
[3, 6, 9, 7, 8, 4, 5, 2, 0]
];

export default function Home() {
  
  const [board, setBoard] = useState(initialBoard);
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [message,setMessage] = useState(null);
  const [alreadyWon,setAlreadyWon] = useState(false);

  // Connect to the Ethereum network using Ethers.js
  const checkWallet = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        console.log('Got the ethereum obejct: ')
      } else {
        console.log('No Wallet found. Connect Wallet')
      }
  
      const accounts = await ethereum.request({ method: 'eth_accounts' })
  
      if (accounts.length !== 0) {
        console.log('Found authorized Account: ', accounts[0])
        setAccount(accounts[0])
        setConnected(true);
        getSudokuBoard();
      } else {
        console.log('No authorized account found')
      }

    } catch (err) {
      console.error(err);
    }
  };

  const connectToWallet = async () => {
		try {
			const { ethereum } = window

			if (!ethereum) {
				console.log('Metamask not detected')
				return
			}
			const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
			console.log('Found account', accounts[0])
			setAccount(accounts[0])
      setConnected(true);
      getSudokuBoard();
		} catch (error) {
			console.log('Error connecting to metamask', error)
		}
	}

  const truncatedAddress = connected
  ? `${account.slice(0, 6)}...${account.slice(-4)}`
  : "";

  // Define a function to handle changes to the Sudoku board
  const handleChange = (row, col, value) => {
    const newBoard = [...board];
    newBoard[row][col] = value;
    setBoard(newBoard);
    console.log(newBoard)
  };

  const getSudokuBoard = async () => {
    try {
      const { ethereum } = window

			if (ethereum) {
        const web3 = new Web3(ethereum);
				const sudokuContract = new web3.eth.Contract(abi, contractAddress);
        const fetchedBoard = await sudokuContract.methods.getBoard().call();
        const parsedBoard = fetchedBoard.map((row) => row.map((num) => parseInt(num)));

        console.log(parsedBoard);
        setBoard(parsedBoard);
       } 
    }
    catch (error) {
      console.log('Error connecting to contract', error)
    }
  }

  const checkWin = async () => {
    setMessage(null)
    try {
      const { ethereum } = window

			if (ethereum) {
        const web3 = new Web3(ethereum);
				const sudokuContract = new web3.eth.Contract(abi, contractAddress);
        await sudokuContract.methods.verifyWin(board).send({
          from: account,
        })
        const result = await sudokuContract.methods.didThePlayerWin(account).call();
        console.log(result);
        if(result == false) {
           setMessage("oops that's wrong, try again!")
        } else {
          setMessage(null)

        }
        setAlreadyWon(result);
       } 
    }
    catch (error) {
      console.log('Error connecting to contract', error)
    }
  }

  const resetWinner = async () => {
    try {
      const { ethereum } = window

			if (ethereum) {
        const web3 = new Web3(ethereum);
				const sudokuContract = new web3.eth.Contract(abi, contractAddress);
        await sudokuContract.methods.resetWin().send({
          from: account,
        })
        const result = await sudokuContract.methods.didThePlayerWin(account).call();
        
        setAlreadyWon(result);
       } 
    }
    catch (error) {
      console.log('Error connecting to contract', error)
    }
  }

  const checkIfAlreadyWon = async () => {
    try {
      const { ethereum } = window
			if (ethereum) {
        const web3 = new Web3(ethereum);
				const sudokuContract = new web3.eth.Contract(abi, contractAddress);
        const result = await sudokuContract.methods.didThePlayerWin(account).call();
        console.log(result)
        setAlreadyWon(result);
       } 
    }
    catch (error) {
    }
  }
  
  useEffect(() => {
		  checkWallet();
      checkIfAlreadyWon();
	}, [account])

  return (
    <>
      <Head>
        <title>sudoku on chain</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className=''>
       <div className='w-screen flex justify-center	mt-6'>
       <h1 className="text-4xl font-bold">
       sudoku on chain
      </h1>
     

       </div>
       <div className='w-screen flex justify-center	mt-6'>
       <button className='mt-6 bg-black text-white p-4 rounded-lg' onClick={connectToWallet}>
      {connected ? `connected (${truncatedAddress})` : "Connect to Wallet"}
    </button>
        </div>
  
       <div className='flex justify-center items-center mt-6' >
      { alreadyWon ?
      
      <div className="grid grid-cols-9 gap-2 bg-gray-200 p-4 mt-6 rounded-md shadow-md">
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <input
            key={`${rowIndex}-${colIndex}`}
            type="number"
            min="1"
            max="9"
            disabled
            className={clsx("w-8 h-8 text-center border border-gray-400 rounded-md", {
              "bg-gray-300": cell !== 0,
            })}
            value={cell !== 0 ? cell : ""}
            onChange={(e) => handleChange(rowIndex, colIndex, parseInt(e.target.value))}
          />
        ))
      ))}
     
      </div> : 
      
      <div className="grid grid-cols-9 gap-2 bg-gray-200 p-4 mt-6 rounded-md shadow-md">
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <input
            key={`${rowIndex}-${colIndex}`}
            type="number"
            min="1"
            max="9"
            className={clsx("w-8 h-8 text-center border border-gray-400 rounded-md", {
              "bg-gray-300": cell !== 0,
            })}
            value={cell !== 0 ? cell : ""}
            onChange={(e) => handleChange(rowIndex, colIndex, parseInt(e.target.value))}
          />
        ))
      ))}
     
      </div>

      }
    

       </div>

       <div className='flex justify-center items-center mt-6'>
        {
          alreadyWon ? 
            <div>
               <h1 className="text-3xl font-bold">
                   you've won !
               </h1>
               <div className='flex justify-center items-center' >
               <button className='mt-6  bg-black text-white p-4 rounded-lg' onClick={resetWinner}>
               reset
                </button>
               </div>
     
            </div> :    
          <button className='mt-6 bg-black text-white p-4 rounded-lg' onClick={checkWin}>
          did i win?
         </button>
        }
    
      </div>    
      <div className='flex justify-center items-center text-2xl text-red-500 mt-6'>
        {message}
      </div>    
      </main>
    </>
  )
}
