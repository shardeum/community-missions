// SPDX-License-Identifier: GPL

pragma solidity ^0.8.9;

contract WaterTankVolume{
    struct userWaterTankData{
        uint currentBlockTime;
        uint[9] currentTankWalls;
        uint totalTanks;
        uint currentWaterVolume;
        uint[2] maxWallPair;
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
            time = time / 10;
        }
        userTankData[msg.sender].totalTanks += 1;
        delete userTankData[msg.sender].maxWallPair;
        userTankData[msg.sender].currentWaterVolume = 0;
    }

    function max(uint a, uint b) internal pure returns (uint){
        return a > b ? a : b;
    }

    function min(uint a, uint b) internal pure returns (uint){
        return a < b ? a : b;
    }

    function maxArea(uint[9] memory tank) internal pure returns (uint[2] memory, uint){
        uint maximumArea;
        uint[2] memory pair;
        uint left = 0;
        uint right = tank.length - 1;
        while(left < right){
            uint area = min(tank[left], tank[right]) * (right - left);
            if(area == max(maximumArea, area)){
                //area is max. set pair
                pair[0] = left;
                pair[1] = right;
            }
            maximumArea = max(maximumArea, area);
            if(tank[left] < tank[right]){
                left++;
            }
            else{
                right--;
            }
        }
        return (pair, maximumArea);
    }

    function currentTankMaxWaterVolume() external{
        (uint[2] memory pair, uint volume) = maxArea(userTankData[msg.sender].currentTankWalls);
        userTankData[msg.sender].maxWallPair = pair;
        userTankData[msg.sender].currentWaterVolume = volume;
        userTankData[msg.sender].totalWaterVolume += volume;
    }

    function getTankData() external view returns (userWaterTankData memory){
        return userTankData[msg.sender];
    }
}