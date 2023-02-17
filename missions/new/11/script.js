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
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "log",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256[12]",
                "name": "",
                "type": "uint256[12]"
            }
        ],
        "name": "log12",
        "type": "event"
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
        "name": "getCurrentTankWaterLevel",
        "outputs": [
            {
                "internalType": "uint256[12]",
                "name": "",
                "type": "uint256[12]"
            }
        ],
        "stateMutability": "view",
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

const contractAddress = "0x34ee5e494a43e3dc91fb39a5831ba2cee3c30660";
async function viewAccounts(){
    let accounts = await provider.listAccounts();
    if(accounts.length){
        isConnected = true;
        address = accounts[0];
        updateDOM();
    }
}


function drawRect(x, y, w,  h, color, showNumbers){
    var c = document.getElementById("tank-data");
	var ctx = c.getContext("2d");
	ctx.fillStyle = color;

	ctx.fillRect(x * 50, 200 - (y * 20), w, y * 20);

		ctx.strokeStyle = 'black';
		ctx.font = "14px Arial";
	if (showNumbers) {
		ctx.fillText(y.toString(), (x * 50) + 25, 10);
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

function setTankDataToDOM(tank, levels) {
    tank = tank.map(x => formatData(x));
    
	clearCanvas();

    tank.forEach(
        (y, index) => {
			drawRect(index, levels[index], 50, levels[index], "blue", false);
			drawRect(index, y, 50, y, "grey", true);
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
    const mapData = await contract.getTankData();
	const levels = await contract.getCurrentTankWaterLevel();
	console.log(levels);

    if(mapData.totalTanks > 0){
        setTankDataToDOM(mapData.currentTankWalls, levels);
    }
    setStatsToBoard(mapData.totalTanks, mapData.currentWaterVolume, mapData.totalWaterVolume, mapData.currentBlockTime);
}

async function createNewMap(){
    contract.createNewMap().then(success => {
		return success.wait().then(done => getTank());
	});
    await getTank();
}

async function calculateVolume(){
    contract.currentTankTotalWaterVolume().then(success => success.wait().then(done => getTank()));
    await getTank();
}