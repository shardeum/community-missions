const provider = new ethers.providers.Web3Provider(window.ethereum);
let address, contract, isConnected = false;
let walletConnectBtn = document.querySelector('.connect-wallet');
let generateNewBoardbtn = document.querySelector('.generate-new-board');
let computePathsbtn = document.querySelector('.compute-paths');

walletConnectBtn.addEventListener('click', getAccounts);
generateNewBoardbtn.addEventListener('click', generateNewBoard);
computePathsbtn.addEventListener('click', computePaths);
const gridItems = document.querySelectorAll('.grid-item');

// Loop through the grid items and do something with each one
gridItems[0].innerText = "Start";
gridItems[8].innerText = "Escape";

viewAccounts();

const ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "a",
				"type": "uint256"
			}
		],
		"name": "num",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "a",
				"type": "string"
			}
		],
		"name": "str",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "computePathsCurrentBoard",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "generateNewBoard",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCurrentPaths",
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
		"name": "getCurrentRoom",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "currentBlockTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256[3][3]",
						"name": "currentRoomCoordinates",
						"type": "uint256[3][3]"
					},
					{
						"internalType": "uint256",
						"name": "currentPaths",
						"type": "uint256"
					}
				],
				"internalType": "struct EscapeTheRoom.userEscapeRoomData",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
// 0x826b3938f15545de434c70a9f8ae653c7e6c9467
// 0x3e4a3e6c3b446fD7a59c3dAdc2ba0db9a80Fec62
// 0x59b38d27D6320C1141031c8c8E7F1cC09b6A766A liberty
// 0x15323527B4CaF99E4B19020DEC2492DB2ab1B415 sepolia
const contractAddress = "0x59b38d27D6320C1141031c8c8E7F1cC09b6A766A";
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
    // getGrid();
}

function setCurrentRoomDataToDOM(currentRoom) {
    console.log("setting grid");
    console.log(currentRoom);
    
    
    const gridItems = document.querySelectorAll('.grid-item');
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if(currentRoom[i][j] == 1){
                gridItems[i*3+j].innerText = "***\n* *\n***";
            }
            else{
                
                gridItems[i*3+j].innerText = "";
            
            }
            
        }
    }
    gridItems[0].innerText = "Start";
    gridItems[8].innerText = "Escape";


}


function setStatsToBoard(curVolume,  blockTime){
    if (curVolume == '0') {
        curVolume = '-';
    }
    // document.querySelector('.stats .current-volume .current-volume-value').innerText = curVolume;

    document.querySelector('.stats .block-time .block-time-value').innerText = blockTime;

}


async function getGrid(){
    const currentRoom = await contract.getCurrentRoom();
    console.log("refreshed grid");
    console.log(currentRoom);
    setCurrentRoomDataToDOM(currentRoom.currentRoomCoordinates);
    setStatsToBoard( currentRoom.currentPaths, currentRoom.currentBlockTime);
}

async function generateNewBoard(){
    contract.generateNewBoard().then(success => {
        console.log("generated new board");
		return success.wait().then(done => getGrid());
	});
    // await getGrid();
}
async function getPaths(){

    const currentRoom = await contract.getCurrentRoom();
        
    document.querySelector('.stats .current-volume .current-volume-value').innerText = currentRoom.currentPaths;

}

async function computePaths(){
    console.log("compute paths");
    contract.computePathsCurrentBoard().then(success => success.wait().then(
        done =>  {
            
        getGrid();
        getPaths();
        }
        ));
    
    // await getGrid();
}