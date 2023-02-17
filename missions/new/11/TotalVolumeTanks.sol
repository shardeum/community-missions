// SPDX-License-Identifier: GPL

pragma solidity ^0.8.9;

contract TotalVolumeTanks{
    struct userWaterTankData{
        uint currentBlockTime;
        uint[12] currentTankWalls;
        uint totalTanks;
        uint currentWaterVolume;
        uint totalWaterVolume;
    }

    mapping(address => userWaterTankData) userTankData;

    constructor(){}

    function createNewMap() external{
        uint time = block.timestamp;
        userTankData[msg.sender].currentBlockTime = time;
        uint8 i = 9;
        while(i > 0){
            i--;
            userTankData[msg.sender].currentTankWalls[i] = time % 10;
            if(userTankData[msg.sender].currentTankWalls[i] == 0){
                userTankData[msg.sender].currentTankWalls[i] = 1;
            }
            else
            if(userTankData[msg.sender].currentTankWalls[i] == 9){
                userTankData[msg.sender].currentTankWalls[i] = 8;
            }
            userTankData[msg.sender].currentTankWalls[9] = 1;
            userTankData[msg.sender].currentTankWalls[10] = 1;
            userTankData[msg.sender].currentTankWalls[11] = 8;
            time = time / 10;
            
        }
        userTankData[msg.sender].totalTanks += 1;
        userTankData[msg.sender].currentWaterVolume = 0;
    }

    function max(uint a, uint b) internal pure returns (uint){
        return a > b ? a : b;
    }

    function min(uint a, uint b) internal pure returns (uint){
        return a < b ? a : b;
    }

    function currentTankTotalWaterVolume() external{
        
        (uint volume, uint[12] memory level) = maxVolume(userTankData[msg.sender].currentTankWalls);
        userTankData[msg.sender].currentWaterVolume = volume;
        userTankData[msg.sender].totalWaterVolume += volume;
    }

    function getCurrentTankWaterLevel() external view returns (uint[12] memory){
        (uint volume, uint[12] memory level) = maxVolume(userTankData[msg.sender].currentTankWalls);
        return level;
    }
    
    function maxVolume(uint[12] memory tank) internal pure returns (uint, uint[12] memory){
        uint n = 12;  
        uint[12] memory left; 
        uint[12] memory right;
        left[0]=tank[0];
        uint i = 1;
        while(i < n){
            left[i] = max(left[i-1],tank[i]);
            i++;
        }
        right[n-1]= tank[n-1];
        i = n - 2;
        while(i > 0){
            right[i]=max(right[i+1],tank[i]);
            i--;
        }
        uint ans = 0;  
        i = 0;

        uint[12] memory level;
        while( i < n){
            if (min(left[i], right[i]) > tank[i]) {
                level[i] = min(left[i],right[i]);
                ans += max((min(left[i],right[i])-tank[i]),0);
            }
            i++;
        }
        return (ans, level);
    }

    function getTankData() external view returns (userWaterTankData memory){
        return userTankData[msg.sender];
    }
}