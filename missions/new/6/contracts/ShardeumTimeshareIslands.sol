// SPDX-License-Identifier: GPL

pragma solidity ^0.8.9;

contract ShardeumTimeshareIslands{

    struct userMapIslandData{
        uint8[5][3] currentTimeMap;
        uint totalMaps;
        uint totalIslands;
    }
    uint8 ROWS = 3;
    uint8 COLS = 5;
    mapping(address => userMapIslandData) userMapData;

    function createNewMap() public returns (userMapIslandData memory) {
        uint8[5][3] memory mapArray;
        for(uint i = 0; i < ROWS; i++){
            for(uint j = 0; j < COLS; j++){
                mapArray[i][j] = uint8((block.timestamp >> (i * j)) & 1);
            }
        }
        userMapData[msg.sender].currentTimeMap = mapArray;
        return userMapData[msg.sender];
    }

    function getUserData() external view returns (userMapIslandData memory){
        return userMapData[msg.sender];
    }

    function countIslands() external returns (userMapIslandData memory){
        userMapData[msg.sender].totalIslands += numberOfIslands(userMapData[msg.sender].currentTimeMap);
        userMapData[msg.sender].totalMaps++;
        return createNewMap();
    }

    function numberOfIslands(uint8[5][3] memory grid) internal view returns (uint8){
        if(grid.length == 0 || grid[0].length == 0){
            return 0;
        }
        uint8 count = 0;
        for(uint8 i = 0; i < ROWS; i++){
            for(uint8 j = 0; j < COLS; j++){
                if(grid[i][j] == 1){
                    count++;
                    searchForConnections(grid, i, j);
                }
            }
        }
        return count;
    }

    function searchForConnections(uint8[5][3] memory grid, uint8 i, uint8 j) internal view returns (uint8){
        if(i < 0 || i >= ROWS || j < 0 || j >= COLS || grid[i][j] != 1){
            return 0;
        }
        grid[i][j] = 0;
        searchForConnections(grid, i - 1, j);
        searchForConnections(grid, i + 1, j);
        searchForConnections(grid, i, j - 1);
        searchForConnections(grid, i, j + 1);
        return 0;
    }


}
