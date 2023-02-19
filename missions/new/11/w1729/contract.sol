pragma solidity ^0.8.0;

contract TankGame {
    struct userWaterTankData{
        uint256 currentBlockTime;
        uint8[12] currentTankWalls;
        uint256  totalTanks;
        uint256 currentWaterVolume;
        uint256 totalWaterVolume;
    }
     mapping (address => userWaterTankData) public usertank;

    function createNewMap() public {
        usertank[msg.sender].currentBlockTime = block.timestamp;
        uint256 timeToWall =  usertank[msg.sender].currentBlockTime % 10000000000; 
        for (uint8 i = 0; i < 9; i++) {
            uint8 wallHeight = uint8((timeToWall / (10 ** (8 - i))) % 10);
            if (wallHeight == 0) {
                usertank[msg.sender].currentTankWalls[i] = 1; 
            } else if (wallHeight == 9) {
                usertank[msg.sender].currentTankWalls[i] = 8;
            } else {
                usertank[msg.sender].currentTankWalls[i] = wallHeight;
            }
        }
        usertank[msg.sender].currentTankWalls[9]=1;
        usertank[msg.sender].currentTankWalls[10]=1;
        usertank[msg.sender].currentTankWalls[11]=8;
        usertank[msg.sender].totalTanks++;
        usertank[msg.sender].currentWaterVolume=0;
    }

    function computeCurrentTankWaterVolume()  public{
        uint256 l=0;
        uint256 r=11;
        uint256 result;
        uint8[12] memory tankwalls=usertank[msg.sender].currentTankWalls;
        uint8 leftMax=tankwalls[l];
        uint8 rightMax=tankwalls[r];
        while(l<r){
            if(leftMax<rightMax){
             l=l+1;
             leftMax=leftMax>tankwalls[l]?leftMax:tankwalls[l];
             result=result+leftMax-tankwalls[l];
            }else{
                r=r-1;
                rightMax=rightMax>tankwalls[r]?rightMax:tankwalls[r];
                result=result+rightMax-tankwalls[r];
            }
        }
        usertank[msg.sender].currentWaterVolume=result;
        usertank[msg.sender].totalWaterVolume=usertank[msg.sender].totalWaterVolume+result;

    }

    function currentTankWalls(address sender) public view returns(uint8[12] memory){
        return usertank[sender].currentTankWalls;
    }
}
