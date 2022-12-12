// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;

contract Nim {
    struct Stat {
        uint marblesOnTable;
        uint playerWins;
        uint computerWins;
    }
    mapping(address => Stat) playerStats;

    constructor() {}

    function newGame() public {
        Stat storage userStat = playerStats[msg.sender];
        if (userStat.marblesOnTable == 0) {
            userStat.marblesOnTable = 12;
        }
    }

    function computerWin() internal {
        Stat storage userStats = playerStats[msg.sender];
        userStats.computerWins = userStats.computerWins + 1;
    }

    function turn(uint marbles) public {
        if (playerStats[msg.sender].marblesOnTable == 12) {
            require(marbles <= 3, "Marbles should be less than 3");
        }

        if (playerStats[msg.sender].marblesOnTable < 12) {
            require(
                marbles > 0 && marbles <= 3,
                "Marbles should be atleast 1 & at max 3"
            );
        }

        Stat storage userStats = playerStats[msg.sender];
        userStats.marblesOnTable = userStats.marblesOnTable - marbles;
        if (userStats.marblesOnTable == 0) {
            userStats.playerWins = userStats.playerWins + 1;
            return;
        }
        if (
            userStats.marblesOnTable == 4 ||
            userStats.marblesOnTable == 8 ||
            userStats.marblesOnTable == 12
        ) {
            userStats.marblesOnTable = userStats.marblesOnTable - 1;
            if (userStats.marblesOnTable == 0) {
                computerWin();
                return;
            }
        } else if (userStats.marblesOnTable < 4) {
            userStats.marblesOnTable =
                userStats.marblesOnTable -
                userStats.marblesOnTable;

            if (userStats.marblesOnTable == 0) {
                computerWin();
                return;
            }
        } else {
            uint marbleToRemove = userStats.marblesOnTable % 4;
            userStats.marblesOnTable =
                userStats.marblesOnTable -
                marbleToRemove;

            if (userStats.marblesOnTable == 0) {
                computerWin();
                return;
            }
        }
    }
}
