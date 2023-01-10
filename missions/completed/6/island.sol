// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Island{
    struct userMapIslandData {
    uint currentTimeMap;
    uint totalMaps;
    uint totalIslands;
    uint[5][5]  timestampArray;
     
}
mapping(address => userMapIslandData) public landdata;
    function createNewMap(address sender) public  {
    // Convert block.timestamp to a 2D array
    landdata[sender].currentTimeMap=block.timestamp;
    for (uint i = 0; i < 3; i++) {
        for (uint j = 0; j < 5; j++) {
           landdata[sender].timestampArray[i][j] = (block.timestamp >> (5*i + j)) & 1;
        }
    }
    landdata[sender].totalMaps++;
    }

    function numIslands(uint[5][5] memory grid) public pure returns(uint){
        uint rowlen=3;
        uint collen=5;
        uint islands=0;
        for(uint r=0;r<rowlen;r++){
            for(uint c=0;c<collen;c++){
                if(grid[r][c]==1){
                    find(int(r),int(c),grid);
                    islands++;

                }
            }

        }
        return islands;
    }
    function find(int r,int c,uint[5][5] memory grid) public pure returns(uint8){
        uint r1=uint(r);
        uint c1=uint(c);
       if(r<0 || r>=3 || c<0 || c>=5){
        return 0;
       }
       if(grid[r1][c1]==1){
        grid[r1][c1] = 0;
        find(r-1,c,grid);
        find(r+1,c,grid);
        find(r,c+1,grid);
        find(r,c-1,grid);

       }
       return 0;
    }

    function countIslands() public {
    landdata[msg.sender].totalIslands=numIslands(landdata[msg.sender].timestampArray);

    }
    function island(address sender) public view returns(uint[5][5] memory){
        return landdata[sender].timestampArray;
    } 
    
}