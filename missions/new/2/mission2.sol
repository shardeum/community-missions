// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Nim {
    struct playerStates {
        uint marblesOnTable;
        uint playerWins;
        uint computerWins;
    }
    mapping(address => playerStates) public players;
}
