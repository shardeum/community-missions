const provider = new ethers.providers.Web3Provider(window.ethereum);

let connected = false;
const ethereumButton = document.querySelector(".enableEthereumButton");
const showAccount = document.querySelector(".showAccount");
const chainID = document.querySelector(".chainID");

contract_abi = [
  {
    inputs: [
      {
        internalType: "uint8",
        name: "x",
        type: "uint8",
      },
    ],
    name: "makeMove",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8[9]",
        name: "board",
        type: "uint8[9]",
      },
      {
        internalType: "bool",
        name: "is_maximizing",
        type: "bool",
      },
    ],
    name: "minimax",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "newGame",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "playerStates",
    outputs: [
      {
        internalType: "uint256",
        name: "playerWins",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "computerWins",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "tiedGames",
        type: "uint256",
      },
    ],
    stateMutability: "view",
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
    name: "showBoard",
    outputs: [
      {
        internalType: "uint8[9]",
        name: "",
        type: "uint8[9]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
contract_address = "0xCbE10531aBC679EdCF66535755ac22308bf57010"; // Nim contract on shardeum liberty 1.6
const tictoe = new ethers.Contract(contract_address, contract_abi, provider);

async function updatePlayerState() {
  if (connected) {
    playerState = await tictoe.playerStates(getCurrentAccount());
    console.log(playerState);
    document.getElementById("playerWins").textContent =
      playerState["playerWins"];
    document.getElementById("computerwins").textContent =
      playerState["computerWins"];
    document.getElementById("tiedGames").textContent = playerState["tiedGames"];
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
