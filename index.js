import Web3 from 'web3';

const contractABI = [{ "inputs": [{ "internalType": "address", "name": "player", "type": "address" }], "name": "isGameOver", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint8", "name": "x", "type": "uint8" }, { "internalType": "uint8", "name": "y", "type": "uint8" }], "name": "makeMove", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "player", "type": "address" }], "name": "minimax", "outputs": [{ "internalType": "uint8[2]", "name": "", "type": "uint8[2]" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "player", "type": "address" }, { "internalType": "enum TicTacToe.Turn", "name": "turn", "type": "uint8" }, { "internalType": "uint8", "name": "depth", "type": "uint8" }], "name": "minimaxScore", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "newGame", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "player", "type": "address" }, { "internalType": "uint8", "name": "piece", "type": "uint8" }], "name": "hasWon", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "isBoardFull", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }];
const contractAddress = '0x1FF1d9AAF767182F53efffa65D63986b2348480D';

// initialize the Web3.js library
const web3 = new Web3(Web3.givenProvider || 'https://bsc-dataseed1.defibit.io/');

// create an instance of the TicTacToe contract
const contract = new web3.eth.Contract(contractABI, contractAddress);

// get the player's address
const playerAddress = web3.eth.accounts[0];

// get the player and computer scores from the contract
contract.methods.getScores(playerAddress).call((error, result) => {
    if (error) {
        console.error(error);
    } else {
        // update the player and computer scores on the page
        document.getElementById('player-wins').innerHTML = result.playerWins;
        document.getElementById('computer-wins').innerHTML = result.computerWins;
        document.getElementById('tied-games').innerHTML = result.tiedGames;
    }
});


contract.methods.getBoardState(playerAddress).call((error, result) => {
    if (error) {
        console.error(error);
    } else {
        // update the board on the page
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (result[i][j] == 1) {
                    document.getElementById(`square-${i}-${j}`).innerHTML = 'X';
                } else if (result[i][j] == 2) {
                    document.getElementById(`square-${i}-${j}`).innerHTML = 'O';
                }
            }
        }
    }
});


const connectButton = document.getElementById('connect-button');
connectButton.addEventListener('click', () => {
    if (typeof window.ethereum === 'undefined') {
        alert('Please install metamask first.');
        return;
    }

    window.ethereum.request({ method: 'eth_requestAccounts' }).then(() => {
        console.log('Metamask Connected!!');
    }).catch((error) => {
        console.error(error);
    });
});

document.getElementById('board').addEventListener('click', (event) => {
    // get the row and column of the clicked square
    const row = event.target.id.split('-')[1];
    const col = event.target.id.split('-')[2];
    // make the move for the player
    contract.methods.makeMove(row, col).send({ from: playerAddress }, (error, transactionHash) => {
        if (error) {
            console.error(error);
        } else {
            console.log(`Transaction hash: ${transactionHash}`);
            // update the board state from the contract
            contract.methods.getBoardState(playerAddress).call((error, result) => {
                if (error) {
                    console.error(error);
                }
                else {
                    // update the board on the page
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            if (result[i][j] == 1) {
                                document.getElementById(`square-${i}-${j}`).innerHTML = 'X';
                            } else if (result[i][j] == 2) {
                                document.getElementById(`square-${i}-${j}`).innerHTML = 'O';
                            }
                        }
                    }
                }
            });
        }

    }
    )
});