//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract Sudoku{
    uint8[9][9] currentBoard;

    mapping(address => bool) didThePlayerWin;

    constructor(){
        currentBoard = [[2,8,3,5,6,4,9,1,7],[7,1,9,0,3,8,4,6,5],[5,6,4,9,7,1,8,3,2],[1,7,2,4,5,3,6,8,9],[8,4,6,1,9,7,5,2,3],[3,9,5,8,2,0,7,4,1],[4,2,1,7,8,9,3,5,6],[9,3,8,6,1,5,2,7,4],[6,5,7,3,4,2,1,9,8]];
    }

    function getBoard() external view returns (uint8[9][9] memory){
        return currentBoard;
    }

    function verifyWin(uint[] memory inputs) external returns (bool){
        require(inputs.length % 3 == 0, "Invalid input"); //array in the format x, y, value, 
        uint i = 0;
        uint8[9][9] memory userBoard = currentBoard;
        while(i < inputs.length / 3){
            userBoard[(inputs[i * 3])][inputs[(i * 3) + 1]] = uint8(inputs[(i * 3) + 2]);
            i++;
        }
        if(isSudokuWin(userBoard)){
            didThePlayerWin[msg.sender] = true;
            return true;
        }
        else{
            return false;
        }
    }

    function getUserStats() external view returns (bool){
        return didThePlayerWin[msg.sender];
    }

    function isSudokuWin(uint8[9][9] memory board) private pure returns (bool) {
        for (uint8 i = 0; i < 9; i++) {
            uint8[] memory row = new uint8[](9);
            for (uint8 j = 0; j < 9; j++) {
                row[j] = board[i][j];
            }
            if (!isValidSet(row)) {
                return false;
            }
        }
        
        for (uint8 i = 0; i < 9; i++) {
            uint8[] memory col = new uint8[](9);
            for (uint8 j = 0; j < 9; j++) {
                col[j] = board[j][i];
            }
            if (!isValidSet(col)) {
                return false;
            }
        }
        
        for (uint8 i = 0; i < 9; i += 3) {
            for (uint8 j = 0; j < 9; j += 3) {
                uint8[] memory subgrid = new uint8[](9);
                for (uint8 k = 0; k < 3; k++) {
                    for (uint8 l = 0; l < 3; l++) {
                        subgrid[k * 3 + l] = board[i + k][j + l];
                    }
                }
                if (!isValidSet(subgrid)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    function isValidSet(uint8[] memory set) private pure returns (bool) {
        for (uint8 i = 0; i < 9; i++) {
            for (uint8 j = i + 1; j < 9; j++) {
                if (set[i] == set[j]) {
                    return false;
                }
            }
        }
        return true;
    }
}