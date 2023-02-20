const provider = new ethers.providers.Web3Provider(window.ethereum);

let connected = false;
const ethereumButton = document.querySelector(".enableEthereumButton");
const showAccount = document.querySelector(".showAccount");
const chainID = document.querySelector(".chainID");
let tankwalls;
let waterwalls = [];
contract_abi = [
  {
    inputs: [],
    name: "computeCurrentTankWaterVolume",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "createNewMap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "currentTankWalls",
    outputs: [
      {
        internalType: "uint8[12]",
        name: "",
        type: "uint8[12]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "usertank",
    outputs: [
      {
        internalType: "uint256",
        name: "currentBlockTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalTanks",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currentWaterVolume",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalWaterVolume",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
contract_address = "0x6dE67264A6bBac0F2d4c7C9149b0BB5B1881e4D1"; // Nim contract on shardeum liberty 1.6
const watertank = new ethers.Contract(contract_address, contract_abi, provider);

async function updatePlayerState() {
  if (connected) {
    userState = await watertank.usertank(getCurrentAccount());
    walls = await watertank.currentTankWalls(getCurrentAccount());
    console.log(userState);
    console.log(walls);
    tankwalls = walls;
    document.getElementById("bt").textContent = userState["currentBlockTime"];
    document.getElementById("cw").textContent = walls;
    document.getElementById("tt").textContent = userState["totalTanks"];
    document.getElementById("cv").textContent = userState["currentWaterVolume"];
    document.getElementById("tv").textContent = userState["totalWaterVolume"];

    if (userState["currentWaterVolume"] > 0) {
      plotWater();
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    plotWalls();
  }
}
setInterval(updatePlayerState, 3000);

ethereumButton.addEventListener("click", () => {
  if (typeof window.ethereum !== "undefined") {
    getAccount();
  } else {
    alert("MetaMask is not installed !");
  }
});
const createtank = document.querySelector(".createtank");
const tankvolume = document.querySelector(".tankvolume");

createtank.addEventListener("click", () => {
  checkNetwork();
  const signer = provider.getSigner();
  const user = watertank.connect(signer);
  tx = user.createNewMap();
});
tankvolume.addEventListener("click", () => {
  checkNetwork();
  const signer = provider.getSigner();
  const user = watertank.connect(signer);
  tx = user.computeCurrentTankWaterVolume();
});

async function getAccount() {
  const accounts = await provider.send("eth_requestAccounts", []);
  const account = accounts[0];
  showAccount.innerHTML = account;
  connected = true;
  checkNetwork();
}

async function checkNetwork() {
  const requiredChainId = "0x1F91";

  if (window.ethereum.networkVersion !== requiredChainId) {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: requiredChainId }],
    });
  }
}

const newGameButton = document.querySelector(".newGameButton");

async function getCurrentAccount() {
  const accounts = await ethereum.request({ method: "eth_accounts" });
  return accounts[0];
}

async function newGame() {
  checkNetwork();
  const account = await getCurrentAccount();
  const signer = provider.getSigner();
  const nimWithSigner = tictoe.connect(signer);
  tx = nimWithSigner.newGame();
}

var canvas = document.getElementById("grid");
var context = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

var rowSize = canvas.width / 12;
var colSize = canvas.height / 8;

for (var x = 0; x <= canvas.width; x += rowSize) {
  context.moveTo(x, 0);
  context.lineTo(x, canvas.height);
}

for (var y = 0; y <= canvas.height; y += colSize) {
  context.moveTo(0, y);
  context.lineTo(canvas.width, y);
}

context.strokeStyle = "#ccc";
context.stroke();

function plotWalls() {
  context.beginPath();
  //   context.strokeStyle = "red";
  context.fillStyle = "black";
  for (let i = 0; i < 12; i++) {
    context.rect(i * 50, 600 - tankwalls[i] * 75, 50, tankwalls[i] * 75);
  }
  context.fill();
  context.stroke();
  context.closePath();
}

function plotWater() {
  waterwalls = trap(tankwalls);
  console.log(waterwalls);
  context.beginPath();
  //   context.strokeStyle = "blue";
  context.fillStyle = "#0077be";
  for (let i = 0; i < 12; i++) {
    if (waterwalls[i] > 0) {
      console.log(
        i * 50,
        600 - (tankwalls[i] + waterwalls[i] * 75),
        50,
        waterwalls[i] * 75
      );
      console.log((tankwalls[i] + waterwalls[i]) * 75);
      context.rect(
        i * 50,
        600 - (tankwalls[i] + waterwalls[i]) * 75,
        50,
        waterwalls[i] * 75
      );
    }
  }
  context.fill();
  context.stroke();
  context.font = "20px Arial";
  // Fill with gradient
  context.fillStyle = "black";
  for (let i = 0; i < 12; i++) {
    if (waterwalls[i] > 0) {
      context.fillText(waterwalls[i], 25 + 50 * i, 25);
    }
  }
  context.closePath();
}

function trap(height) {
  let n = height.length;
  let left = new Array(n);
  let right = new Array(n);
  let water = new Array(n);
  let max = 0;

  // Fill left array
  for (let i = 0; i < n; i++) {
    left[i] = max;
    max = Math.max(max, height[i]);
  }

  // Reset max
  max = 0;

  // Fill right array
  for (let i = n - 1; i >= 0; i--) {
    right[i] = max;
    max = Math.max(max, height[i]);
  }

  // Calculate trapped water
  for (let i = 0; i < n; i++) {
    water[i] = Math.max(Math.min(left[i], right[i]) - height[i], 0);
  }

  return water;
}
