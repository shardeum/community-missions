// const ethers = require('ethers');

// const { ethers } = require("ethers");

// import {ethers} from 'ethers';
const provider = new ethers.providers.Web3Provider(window.ethereum);
let address, contract, isConnected = false;
let walletConnectBtn = document.querySelector('.connect-wallet');
let createMapBtn = document.querySelector('.create-map');
let countIslandBtn = document.querySelector('.count-island');

walletConnectBtn.addEventListener('click', getAccounts);
createMapBtn.addEventListener('click', createNewMap);
countIslandBtn.addEventListener('click', countIslands);

viewAccounts();

const ABI = [
	{
		"inputs": [],
		"name": "countIslands",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint8[5][3]",
						"name": "currentTimeMap",
						"type": "uint8[5][3]"
					},
					{
						"internalType": "uint256",
						"name": "totalMaps",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalIslands",
						"type": "uint256"
					}
				],
				"internalType": "struct ShardeumTimeshareIslands.userMapIslandData",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "createNewMap",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint8[5][3]",
						"name": "currentTimeMap",
						"type": "uint8[5][3]"
					},
					{
						"internalType": "uint256",
						"name": "totalMaps",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalIslands",
						"type": "uint256"
					}
				],
				"internalType": "struct ShardeumTimeshareIslands.userMapIslandData",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getUserData",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint8[5][3]",
						"name": "currentTimeMap",
						"type": "uint8[5][3]"
					},
					{
						"internalType": "uint256",
						"name": "totalMaps",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalIslands",
						"type": "uint256"
					}
				],
				"internalType": "struct ShardeumTimeshareIslands.userMapIslandData",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0xf8D2e4b8f79E7dba91c390F23603802Bf28a3beE";

async function viewAccounts(){
    let accounts = await provider.listAccounts();
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
        updateDOM();
    }
}

async function getAccounts(){
    let accounts = await provider.send('eth_requestAccounts', []);
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
        updateDOM();
    }
}

function updateDOM(){
    document.querySelector('.connect-wallet').remove();
    document.querySelector('.wallet').innerHTML = `<p>${address}</p>`;
    contractInit();
}

function contractInit(){
    contract = new ethers.Contract(contractAddress, ABI, provider.getSigner());
    getMap();
}

function setMapDataToBoard(map){
    for(let i in map){
        for(let j in map[i]){
            if(map[i][j] == 1){
                setColor(i,j);
            }
        }
    }
}

function setStatsToBoard(mapCount, islandCount){
    document.querySelector('.stats .total-map-count .map-count').innerText = mapCount;
    document.querySelector('.stats .total-island-count .island-count').innerText = islandCount;
}

function setColor(i, j){
    document.querySelector(`[data-key='${i}-${j}']`).style.backgroundColor = "#0f0";
}

async function getMap(){
    let mapData = await contract.getUserData();
    setMapDataToBoard(mapData.currentTimeMap);
    setStatsToBoard(mapData.totalMaps, mapData.totalIslands);
}

async function createNewMap(){
    await contract.createNewMap();
    await getMap();
}

async function countIslands(){
    contract.countIslands().then(success => success.wait().then(done => getMap()));
    // await getMap();
}
