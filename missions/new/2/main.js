const provider = new ethers.providers.Web3Provider(window.ethereum)

let connected = false;
const ethereumButton = document.querySelector('.enableEthereumButton');
const showAccount = document.querySelector('.showAccount');
const chainID = document.querySelector('.chainID');

contract_abi = [{"inputs":[],"name":"newGame","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"players","outputs":[{"internalType":"uint256","name":"marblesOnTable","type":"uint256"},{"internalType":"uint256","name":"playerWins","type":"uint256"},{"internalType":"uint256","name":"computerWins","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"marblesAmount","type":"uint256"}],"name":"turn","outputs":[],"stateMutability":"nonpayable","type":"function"}] ;
contract_address = '0xa8D28246fdee56630C7Cbf3b7686077a69244880'; // Nim contract on shardeum liberty 1.6
const nimContract = new ethers.Contract(contract_address, contract_abi, provider);

async function updatePlayerState() {
  if (connected) {
    console.log('updating');
    playerState = await nimContract.players(getCurrentAccount());
    console.log(playerState);
    document.getElementById("marblesOnTable").textContent = playerState['marblesOnTable'];
    document.getElementById("playerWins").textContent = playerState['playerWins'];
    document.getElementById("computerWins").textContent = playerState['computerWins'];
    
    marble = '<td><img src="images/marble.png" width="50"></td>';
    var row = document.getElementById("board");
    row.innerHTML = marble.repeat(playerState['marblesOnTable']);
  }
}
setInterval(updatePlayerState, 3000);

ethereumButton.addEventListener('click', () => {
  if (typeof window.ethereum !== 'undefined') {
    getAccount();
}
  else {
    alert('MetaMask is not installed !'); 
} 

});

async function getAccount() {
  const accounts = await provider.send("eth_requestAccounts", []);
  const account = accounts[0];
  showAccount.innerHTML = account;
  connected = true; 
  checkNetwork();
}

async function checkNetwork(){
  const requiredChainId = "0x1f90" // shardeum liberty 1.6
  
  if (window.ethereum.networkVersion !== requiredChainId) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: requiredChainId }]
        });
  }
}

const newGameButton = document.querySelector('.newGameButton');

async function getCurrentAccount() {
  const accounts = await ethereum.request({ method: 'eth_accounts' });
  return accounts[0];
}

async function newGame() {
  
  checkNetwork();
  const account = await getCurrentAccount();
  const signer = provider.getSigner()
  const nimWithSigner = nimContract.connect(signer);
  tx = nimWithSigner.newGame();
}

newGameButton.addEventListener('click', () => {
  newGame();
});
    

const turnButton = document.querySelector('.turnButton');

async function turn(amount) {
  checkNetwork();
  const account = await getCurrentAccount();
  const signer = provider.getSigner()
  const nimWithSigner = nimContract.connect(signer);
  tx = nimWithSigner.turn(amount);
}

turnButton.addEventListener('click', async () => {
  playerState = await nimContract.players(getCurrentAccount());

  if (document.getElementById("marblesAmount").value == '') {
    alert("Enter a number as argument for turn() !");
  }
  else {
    amount = parseInt(document.getElementById("marblesAmount").value);
    if (playerState['marblesOnTable'] == 12 && amount > 3) {
      alert("You can only take 0 to 3 marbles on the first turn");
    }
    else if (playerState['marblesOnTable'] < 12 && (amount > 3 || amount == 0)) {
      alert("You can only take 1 to 3 marbles after the first turn");
    }
    else if (playerState['marblesOnTable'] == 0) {
      alert("No more marbles on the table, start a new game instead");
    }
    else {
      turn(amount);
    }
  }
});