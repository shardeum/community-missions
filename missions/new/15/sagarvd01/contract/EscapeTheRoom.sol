//SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

contract EscapeTheRoom{
    struct escapeRoomData{
        uint8[3][3] currentRoomCoordinates;
        uint currentPaths;
    }

    mapping(address => escapeRoomData) userEscapeRoomData;

    function generateNewBoard() external{
        uint result = (block.timestamp % 7) + 2;
        uint row = (result - 1) / 3;
        uint col = (result - 1) % 3;
        delete userEscapeRoomData[msg.sender].currentRoomCoordinates;
        userEscapeRoomData[msg.sender].currentRoomCoordinates[row][col] = 1;
    }

    function getNewBoard() external view returns (escapeRoomData memory){
        return userEscapeRoomData[msg.sender];
    }

    function findPaths() external returns (uint){
        uint row = 3;
        uint col = 3;
        uint8[3][3] memory grid = userEscapeRoomData[msg.sender].currentRoomCoordinates;
        uint[3][3] memory dp;

        for(uint i = 0; i < row; i++){
            if(grid[i][0] == 1){
                dp[i][0] = 0;
                break;
            }
            else{
                dp[i][0] = 1;
            }
        }
        for(uint j = 0; j < col; j++){
            if(grid[0][j] == 1){
                dp[0][j] = 0;
                break;
            }
            else{
                dp[0][j] = 1;
            }
        }
        for(uint i = 1; i < row; i++){
            for(uint j = 1; j < col; j++){
                if(grid[i][j] == 1){
                    dp[i][j] = 0;
                }
                else{
                    dp[i][j] = dp[i-1][j] + dp[i][j-1];
                }
            }
        }
        userEscapeRoomData[msg.sender].currentPaths = dp[row-1][col-1];
        return userEscapeRoomData[msg.sender].currentPaths;
    }
}