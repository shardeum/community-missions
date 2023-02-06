const provider = new ethers.providers.Web3Provider(window.ethereum);
let address, contract, isConnected = false;
let walletConnectBtn = document.querySelector('.connect-wallet');
let createMapBtn = document.querySelector('.create-map');
let calcVolume = document.querySelector('.calculate-volume');

walletConnectBtn.addEventListener('click', getAccounts);
createMapBtn.addEventListener('click', createNewMap);
calcVolume.addEventListener('click', calculateVolume);

viewAccounts();

const ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "createNewMap",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "currentTankMaxWaterVolume",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTankData",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "currentBlockTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256[9]",
						"name": "currentTankWalls",
						"type": "uint256[9]"
					},
					{
						"internalType": "uint256",
						"name": "totalTanks",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "currentWaterVolume",
						"type": "uint256"
					},
					{
						"internalType": "uint256[2]",
						"name": "maxWallPair",
						"type": "uint256[2]"
					},
					{
						"internalType": "uint256",
						"name": "totalWaterVolume",
						"type": "uint256"
					}
				],
				"internalType": "struct WaterTankVolume.userWaterTankData",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0xb6107cc896d8b1268589393Abe47bccADF460397";
async function viewAccounts(){
    let accounts = await provider.listAccounts();
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
        updateDOM();
    }
}

function drawLine(x, y, wall = false){
    var c = document.getElementById("tank-data");
    x = x + 1;
    var ctx = c.getContext("2d");
    ctx.beginPath();
    if(wall){
        ctx.strokeStyle = 'red';
    }
    ctx.moveTo(x * 50, 200);
    ctx.lineTo(x * 50, 200 - (y * 20));
    ctx.stroke();
    ctx.strokeStyle = 'black';
    ctx.font = "14px Arial";
    ctx.fillText(y.toString(), (x * 50) - 3, 170 - (y * 20));
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
    getTank();
}

function formatData(x){
    return Number(x);
}

function setTankDataToDOM(tank, walls = [], volume){
    tank = tank.map(x => formatData(x));
    walls = walls.map(y => formatData(y));
    clearCanvas();
    tank.forEach(
        (x, index) => {
            debugger;
            if(volume > 0 && walls.indexOf(index) > -1){
                drawLine(index, x, true);
            }
            else{
                drawLine(index, x);
            }
        }
    )
}

function setStatsToBoard(mapCount, curVolume, totalVolume, blockTime){
    document.querySelector('.stats .total-map-count .map-count').innerText = mapCount;
    document.querySelector('.stats .current-volume .current-volume-value').innerText = curVolume;
    document.querySelector('.stats .total-volume .total-volume-value').innerText = totalVolume;
    document.querySelector('.stats .block-time .block-time-value').innerText = blockTime;
}


function clearCanvas(){
    let canvas = document.getElementById('tank-data');
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
async function getTank(){
    let mapData = await contract.getTankData();
    if(mapData.totalTanks > 0){
        setTankDataToDOM(mapData.currentTankWalls, mapData.maxWallPair, mapData.currentWaterVolume);
    }
    setStatsToBoard(mapData.totalTanks, mapData.currentWaterVolume, mapData.totalWaterVolume, mapData.currentBlockTime);
}

async function createNewMap(){
    contract.createNewMap().then(success => success.wait().then(done => getTank()));
    await getTank();
}

async function calculateVolume(){
    contract.currentTankMaxWaterVolume().then(success => success.wait().then(done => getTank()));
    await getTank();
}