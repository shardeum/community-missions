// SPDX-License-Identifier: GPL

pragma solidity ^0.8.9;


contract TotalVolumeTanks{
    struct userWaterTankData{
        uint currentBlockTime;
        uint[12] currentTankWalls;
        uint[3][12] waterBase;
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
            time = time / 10;
        }
        userTankData[msg.sender].currentTankWalls[9] = 1;
        userTankData[msg.sender].currentTankWalls[10] = 1;
        userTankData[msg.sender].currentTankWalls[11] = 8;
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
        require(userTankData[msg.sender].currentWaterVolume == 0, "Volume already calculated for this tank");
        (uint volume, uint[3][12] memory _waterBase) = totalVolume(userTankData[msg.sender].currentTankWalls);
        userTankData[msg.sender].currentWaterVolume = volume;
        userTankData[msg.sender].totalWaterVolume += volume;
        userTankData[msg.sender].waterBase = _waterBase;

    }

    function totalVolume(uint[12] memory tank) internal pure returns (uint, uint[3][12] memory){
        int vol = 0;
        uint[3][12] memory _waterBase;
        uint waterBaseIndex = 0;
        for(uint i = 1; i < tank.length; i++){
            uint leftMax = 0;
            uint rightMax = 0;
            for(int j = int(i); j >= 0; j--){
                leftMax = max(leftMax, tank[uint(j)]);
            }
            for(uint k = i; k < tank.length; k++){
                rightMax = max(rightMax, tank[k]);
            }
            if(int(min(leftMax, rightMax) - tank[i]) > 0){
                _waterBase[waterBaseIndex++] = [i, min(leftMax, rightMax), tank[i]];
            }
            vol += int(min(leftMax, rightMax) - tank[i]);
        }
        return (uint(vol), _waterBase);
    }


    function getTankData() external view returns (userWaterTankData memory){
        return userTankData[msg.sender];
    }
}
