const provider = new ethers.providers.Web3Provider(window.ethereum);
let address, contract, isConnected = false;
let walletConnectBtn = document.querySelector('.connect-wallet');
let createBoardBtn = document.querySelector('.create-board');
let calcPaths = document.querySelector('.calculate-paths');

walletConnectBtn.addEventListener('click', getAccounts);
createBoardBtn.addEventListener('click', createNewBoard);
calcPaths.addEventListener('click', calculatePaths);

viewAccounts();

const ABI = [
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
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "getBoard",
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
		"name": "getPaths",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userEscapeRoomData",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "currentPaths",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "prevObstacle",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0xc1383a4dcf52261990f03ea3e83214f3af7a9ae1";

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
    getBoard();
    getPaths();
}

function formatData(x){
    return Number(x);
}

function setStatsToBoard(totalPaths){
    document.querySelector('.stats .total-paths .total-paths-value').innerText = totalPaths;
}


async function getBoard(){
    let mapData = await contract.getBoard();
    if(mapData != 0){
        //
        var table = document.getElementById("t1");
        var row, td;
        for (let i = 0; i < 3; i++) {
            row = table.getElementsByTagName("tr")[i];
            for (let j = 0; j < 3; j++) {
                if(i==0 && j==0) {
                    row.getElementsByTagName("td")[j].style.backgroundColor='blue';
                    continue;
                }
                if(i==2 && j==2) {
                    row.getElementsByTagName("td")[j].style.backgroundColor='green';
                    continue;
                }
                td = row.getElementsByTagName("td")[j];
                td.innerHTML = "";
                row.getElementsByTagName("td")[j].style.backgroundColor='white';
            }
        }
        let ii = Math.floor((mapData-1)/3);
        let jj = (mapData-1)%3;
        
        row = table.getElementsByTagName("tr")[ii];
        td = row.getElementsByTagName("td")[jj];
    
        td.innerHTML = "Obstacle";
        td.style.backgroundColor='red';
    }
}

async function getPaths() {
    let v = await contract.getPaths();
    setStatsToBoard(v);
}

async function createNewBoard(){
    contract.generateNewBoard().then(success => success.wait().then(done => getBoard()));
    await getBoard();
}

async function calculatePaths(){
    contract.computePathsCurrentBoard().then(success => success.wait().then(done => getPaths()));
    await getPaths();
}
