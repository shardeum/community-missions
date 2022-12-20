//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract  TicTacToe{
// struct to represent the state of a player
struct PlayerState {
    // 2D array to represent the state of the board
    // 0 represents an empty cell, 1 represents an X, and 2 represents an O
    uint8[3][3] boardState;
    uint8 playerWins;
    uint8 computerWins;
    uint8 tiedGames;
}

// mapping to store the state of each player
mapping(address => PlayerState) playerStates;

// enum to represent the player's turn
enum Turn { X, O }

// function to start a new game
function newGame()  public  {
    // get the player's address
    address player = msg.sender;
    // reset the board state
    playerStates[player].boardState = [        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
}


// function to make a move on the board
function makeMove(uint8 x, uint8 y) public   {
    // get the player's address
    address player = msg.sender;
    // get the current turn
    Turn turn = Turn(playerStates[player].boardState[x][y]);
    // check if the cell is already taken
    require(turn == Turn.X || turn == Turn.O, "This cell is already taken");
    // place the player's piece on the board
    playerStates[player].boardState[x][y] = uint8(turn);
    // check if the game is over
    if (isGameOver(player)) {
        return;
    }
    // compute the next move for the computer using the minimax algorithm
    uint8[2]  memory nextMove = minimax(player);
    // make the move for the computer
    playerStates[player].boardState[nextMove[0]][nextMove[1]] = uint8(Turn.O);
    // check if the game is over
    if (isGameOver(player)) {
        return;
    }
}


// function to determine if the game is over
function isGameOver(address player)  public  returns (bool) {
    // check if a player has won
    if (hasWon(player, uint8(Turn.X))) {
        playerStates[player].playerWins++;
        return true;
    }
    if (hasWon(player, uint8(Turn.O))) {
        playerStates[player].computerWins++;
        return true;
    }
    // check if the board is full
    if (isBoardFull()) {
        playerStates[player].tiedGames++;
        newGame();
        return true;
    }
    return false;
}

// function to check if the board is full
function isBoardFull()  public view returns (bool) {
	address player = msg.sender;
    for (uint8 i = 0; i < 3; i++) {
        for (uint8 j = 0; j < 3; j++) {
            if (playerStates[player].boardState[i][j] == 0) {
                return false;
            }
        }
    }
    return true;
}


// function to check if a player has won
function hasWon(address player, uint8 piece) public  view returns (bool) {
    // check rows
    for (uint8 i = 0; i < 3; i++) {
        if (playerStates[player].boardState[i][0] == piece && playerStates[player].boardState[i][1] == piece && playerStates[player].boardState[i][2] == piece) {
            return true;
        }
    }
    // check columns
    for (uint8 i = 0; i < 3; i++) {
        if (playerStates[player].boardState[0][i] == piece && playerStates[player].boardState[1][i] == piece && playerStates[player].boardState[2][i] == piece) {
            return true;
        }
    }
    // check diagonals
    if (playerStates[player].boardState[0][0] == piece && playerStates[player].boardState[1][1] == piece && playerStates[player].boardState[2][2] == piece) {
        return true;
    }
    if (playerStates[player].boardState[0][2] == piece && playerStates[player].boardState[1][1] == piece && playerStates[player].boardState[2][0] == piece) {
        return true;
    }
    return false;
}

// function to compute the next move for the computer using the minimax algorithm
function minimax(address player)  public  returns (uint8[2] memory) {
    // get the current turn
    Turn turn = Turn(playerStates[player].boardState[0][0]);
    // initialize the best score and move to the worst possible values
    uint8 bestScore = (turn == Turn.X) ? 0 : 10;

    uint8[2]  memory bestMove;
    // loop through all cells on the board
    for (uint8 i = 0; i < 3; i++) {
        for (uint8 j = 0; j < 3; j++) {
            // check if the cell is empty
            if (playerStates[player].boardState[i][j] == 0) {
                // make the move for the current player
                playerStates[player].boardState[i][j] = uint8(turn);
                // compute the score for this move
                uint8 score = minimaxScore(player, turn, 1);          
              // restore the original state of the board
                playerStates[player].boardState[i][j] = 0;
                // update the best score and move if necessary
                if (turn == Turn.X && score > bestScore) {
                    bestScore = score;
                    bestMove = [i, j];
                }
                if (turn == Turn.O && score < bestScore) {
                    bestScore = score;
                    bestMove = [i, j];
                }
            }
        }
    }
    return bestMove;
}

// function to compute the score for a given move using the minimax algorithm
function minimaxScore(address player, Turn turn, uint8 depth) public   returns (uint8) {
    // check if the game is over
    if (isGameOver(player)) {
        // return the score for the current player
        return (turn == Turn.X) ? 10 - depth : depth - 10;
    }
    // initialize the best score to the worst possible value
    uint8 bestScore = (turn == Turn.X) ? 0 : 10;
    // loop through all cells on the board
    for (uint8 i = 0; i < 3; i++) {
        for (uint8 j = 0; j < 3; j++) {
            // check if the cell is empty
            if (playerStates[player].boardState[i][j] == 0) {
                // make the move for the current player
                playerStates[player].boardState[i][j] = uint8(turn);
                // compute the score for this move
                uint8 score = minimaxScore(player, turn == Turn.X ? Turn.O : Turn.X, depth + 1);
                // restore the original state of the board
                playerStates[player].boardState[i][j] = 0;
                // update the best score if necessary
                if (turn == Turn.X && score > bestScore) {
                    bestScore = score;
                }
                if (turn == Turn.O && score < bestScore) {
                    bestScore = score;
                }
            }
        }
    }
    return bestScore;
}
}