const provider = new ethers.providers.Web3Provider(window.ethereum);

let connected = false;
const ethereumButton = document.querySelector(".enableEthereumButton");
const showAccount = document.querySelector(".showAccount");
const chainID = document.querySelector(".chainID");

contract_abi = [
  {
    inputs: [],
    name: "countIslands",
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
    name: "createNewMap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "r",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "c",
        type: "int256",
      },
      {
        internalType: "uint256[5][5]",
        name: "grid",
        type: "uint256[5][5]",
      },
    ],
    name: "find",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "pure",
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
    name: "island",
    outputs: [
      {
        internalType: "uint256[5][5]",
        name: "",
        type: "uint256[5][5]",
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
    name: "landdata",
    outputs: [
      {
        internalType: "uint256",
        name: "currentTimeMap",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalMaps",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalIslands",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[5][5]",
        name: "grid",
        type: "uint256[5][5]",
      },
    ],
    name: "numIslands",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];
contract_address = "0xDE408669de5a8233d74c08b73e004D0a5FeBE1F7"; // Nim contract on shardeum liberty 1.6
const nimContract = new ethers.Contract(
  contract_address,
  contract_abi,
  provider
);

async function updatePlayerState() {
  if (connected) {
    console.log("updating");
    playerState = await nimContract.landdata(getCurrentAccount());
    console.log(playerState);
    document.getElementById("marblesOnTable").textContent =
      playerState["currentTimeMap"];
    document.getElementById("playerWins").textContent =
      playerState["totalMaps"];
    document.getElementById("computerWins").textContent =
      playerState["totalIslands"];

    marble = '<td><img src="images/marble.png" width="50"></td>';
    var row = document.getElementById("board");
    row.innerHTML = marble.repeat(playerState["marblesOnTable"]);
  }
}
setInterval(updatePlayerState, 3000);

async function boardstate() {
  if (connected) {
    console.log("updating2");
    playerState = await nimContract.island(getCurrentAccount());
    console.log(playerState);
    var data = [];
    const grid = document.querySelectorAll(".box");
    console.log(grid);
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 5; j++) {
        data.push(playerState[i][j]);
      }
    }
    for (var box = 0; box < 15; box++) {
      grid[box].style.backgroundColor = data[box] == 0 ? "blue" : "green";
    }
  }
}
setInterval(boardstate, 3000);

ethereumButton.addEventListener("click", () => {
  if (typeof window.ethereum !== "undefined") {
    getAccount();
  } else {
    alert("MetaMask is not installed !");
  }
});

async function getAccount() {
  const accounts = await provider.send("eth_requestAccounts", []);
  const account = accounts[0];
  showAccount.innerHTML = account;
  connected = true;
  checkNetwork();
}

async function checkNetwork() {
  const requiredChainId = "0x1f91"; // shardeum liberty 1.6

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
  const nimWithSigner = nimContract.connect(signer);
  tx = nimWithSigner.createNewMap(account);
}

newGameButton.addEventListener("click", () => {
  newGame();
});

const turnButton = document.querySelector(".turnButton");

async function turn() {
  checkNetwork();
  const account = await getCurrentAccount();
  const signer = provider.getSigner();
  const nimWithSigner = nimContract.connect(signer);
  tx = nimWithSigner.countIslands();
}

turnButton.addEventListener("click", async () => {
  turn();
});
