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
        require(players[msg.sender].marblesOnTable > 0, "No more marbles on table, start a new game");

        // Validate marblesAmount
        // First turn
        if (players[msg.sender].marblesOnTable == 12) {
            require(marblesAmount <= 3, "You can only take 0 to 3 marbles on the first turn");
        }
        // After first turn
        else if (players[msg.sender].marblesOnTable < 12) {
            require(marblesAmount <= 3 && marblesAmount > 0, "You can only take 1 to 3 marbles after the first turn");
        }
        else { revert("Unexpected"); }
        
        // Player's turn
        players[msg.sender].marblesOnTable -= marblesAmount;
        
        // Add win count if player wins
        if (players[msg.sender].marblesOnTable == 0) {
            players[msg.sender].playerWins += 1;
        }
        // Computer's turn if player have not win
        else {
            uint _marblesOnTable = players[msg.sender].marblesOnTable;
            if (_marblesOnTable == 4 || _marblesOnTable == 8 || _marblesOnTable == 12) {
                players[msg.sender].marblesOnTable -= 1;
            }
            players[msg.sender].marblesOnTable -= players[msg.sender].marblesOnTable % 4;
            if (players[msg.sender].marblesOnTable < 4) {
                players[msg.sender].marblesOnTable -= players[msg.sender].marblesOnTable;
            }

            // Add win count if computer wins
            if (players[msg.sender].marblesOnTable == 0) {
                players[msg.sender].computerWins += 1;
            }
        }
    }
}
