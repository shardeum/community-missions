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
		"name": "currentTankTotalWaterVolume",
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
						"internalType": "uint256[12]",
						"name": "currentTankWalls",
						"type": "uint256[12]"
					},
					{
						"internalType": "uint256[3][12]",
						"name": "waterBase",
						"type": "uint256[3][12]"
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
						"internalType": "uint256",
						"name": "totalWaterVolume",
						"type": "uint256"
					}
				],
				"internalType": "struct TotalVolumeTanks.userWaterTankData",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const contractAddress = "0x023f835D86E72F21469c282c3ed73Ce9db994744";
async function viewAccounts(){
    let accounts = await provider.listAccounts();
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
        updateDOM();
    }
}

function drawLine(x, y){
    var c = document.getElementById("tank-data");
    x = x + 1;
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.fillRect(x * 50, 300 - (y * 30), 50, y * 30);
    ctx.stroke();
    ctx.strokeStyle = 'black';
    ctx.font = "14px Arial normal";
    ctx.fillText(y.toString(), (x * 50) + 22, 270 - (y * 30));
}

function drawIndicators(){
    var c = document.getElementById("tank-data");
    var ctx = c.getContext("2d");
    for(let i = 1; i < 10; i++){
        ctx.fillText(i.toString(), 1, (300 - (i * 30)));
        ctx.beginPath();
        ctx.setLineDash([5, 3])
        ctx.moveTo(0, (300 - (i * 30)));
        ctx.lineTo(690, (300 - (i * 30)));
        ctx.stroke();
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
    getTank();
}

function formatData(x){
    return Number(x);
}

function setTankDataToDOM(tank, volume, waterBase){
    tank = tank.map(x => formatData(x));
    clearCanvas();
    tank.forEach(
        (x, index) => {
            drawLine(index, x);
        }
    );
    drawIndicators();
    if(volume > 0){
        setWaterLevel(waterBase);
    }
}

function setWaterLevel(waterBase){
    console.log(waterBase);
    waterBase.forEach(x => {
        x = x.map(y => formatData(y));
        console.log(x);
        if(x[0] != 0){
            drawRain(x);
        }
    });
}

function drawRain(item){
    /**
     * item[0] => index
     * item[1] => minimum height of either wall
     * item[2] => height of current wall
     */
    var c = document.getElementById("tank-data");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    let xPos = (item[0] + 1) * 50;
    let yPos = (item[1]) * 30;
    let height = (item[1] - item[2]) * 30;
    ctx.fillStyle = "#00FFFF";
    ctx.fillRect(xPos, 300 - yPos, 50, height);
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
    ctx.fillStyle = "#000000";
}
async function getTank(){
    let mapData = await contract.getTankData();
    if(mapData.totalTanks > 0){
        setTankDataToDOM(mapData.currentTankWalls, mapData.currentWaterVolume, mapData.waterBase);
    }
    setStatsToBoard(mapData.totalTanks, mapData.currentWaterVolume, mapData.totalWaterVolume, mapData.currentBlockTime);
}

async function createNewMap(){
    contract.createNewMap().then(success => success.wait().then(done => getTank()));
}

async function calculateVolume(){
    contract.currentTankTotalWaterVolume().then(success => success.wait().then(done => getTank()));
}
