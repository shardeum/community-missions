// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Nim {
    struct playerStates {
        uint marblesOnTable;
        uint playerWins;
        uint computerWins;
    }
    mapping(address => playerStates) public players;

    function newGame() public {
        if (players[msg.sender].marblesOnTable == 0) {
            players[msg.sender].marblesOnTable = 12;
        }
    }

    function turn(uint marblesAmount) public {
        // First turn
        if (players[msg.sender].marblesOnTable == 12) {
            require(marblesAmount <= 3);
        }
        else if (players[msg.sender].marblesOnTable < 12) {
            require(marblesAmount <= 3 && marblesAmount > 0);
        }
    }
}
