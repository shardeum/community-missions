const provider = new ethers.providers.Web3Provider(window.ethereum);
let address, contract, isConnected = false;
let walletConnectBtn = document.querySelector('.connect-wallet');

// walletConnectBtn.addEventListener('click', getAccounts);
const ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_i",
				"type": "uint256"
			}
		],
		"name": "d",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "x1",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "y1",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "inp1",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "x2",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "y2",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "inp2",
				"type": "uint256"
			}
		],
		"name": "verifyWin",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
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
		"name": "currentBoard",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCurrentBoard",
		"outputs": [
			{
				"internalType": "uint256[9][9]",
				"name": "",
				"type": "uint256[9][9]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getDidThePlayerWin",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0xca2635247c0cc9055c06e41b21b65f3df5aa0c28";
async function viewAccounts(){
    let accounts = await provider.listAccounts();
    console.log(accounts);
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
        updateDOM();
    }
}

export async function getAccounts(){
    let accounts = await provider.send('eth_requestAccounts', []);
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
        updateDOM();
    }
}


function updateDOM(){
    // document.querySelector('.connect-wallet').remove();
    // document.querySelector('.wallet').innerHTML = `<p>${address}</p>`;
    contractInit();
}


function contractInit(){
    contract = new ethers.Contract(contractAddress, ABI, provider.getSigner());	
    console.log(contract.address);
    // getTank();
}

export async function currentBoard(){
    const board = await contract.getCurrentBoard();
    console.log(board);
    return board;
}
var isWin = false;
async function getDidThePlayerWin(){
    return await contract.getDidThePlayerWin();
}
export async function verifyWin(x1, y1, i1 , x2, y2, i2){
    await contract.verifyWin(x1, y1, i1 , x2, y2, i2).then(success => {
		return success.wait().then(done => {
            getDidThePlayerWin();
        });
    });
    console.log("is win ");
    console.log(await getDidThePlayerWin());
    return await getDidThePlayerWin();
}

viewAccounts();
contractInit();

