// SPDX-License-Identifier: GPL

pragma solidity ^0.8.9;

contract EscapeTheRoom {

    struct escapeRoomData{
        uint[3][3] currentRoomCoordinates;
        uint currentPaths;
        uint prevObstacle;
    }

    event d(uint p);
    event dd(uint[3][3] p);

    mapping(address => escapeRoomData) public userEscapeRoomData;

    constructor(){}

    function generateNewBoard() external {
        uint time = block.timestamp;
        uint obstacle = (time % 7) + 2;
        emit d(obstacle);
        uint prevObs = userEscapeRoomData[msg.sender].prevObstacle;
        if(prevObs != 0) userEscapeRoomData[msg.sender].currentRoomCoordinates[(prevObs - 1)/3][(prevObs - 1)%3] = 0;
        userEscapeRoomData[msg.sender].currentRoomCoordinates[(obstacle - 1)/3][(obstacle - 1)%3] = 1;
        userEscapeRoomData[msg.sender].prevObstacle = obstacle;
    }

    function computePathsCurrentBoard() external {
        uint[3][3] memory paths;
        uint[3][3] memory room = userEscapeRoomData[msg.sender].currentRoomCoordinates;
        
        paths[0][0]=1;
        for(uint i=0;i<3;i++){
            for(uint j=0;j<3;j++){
                if(i==0 && j==0) continue;
                if(i==0) {
                    paths[i][j] = paths[i][j-1];
                    if(room[i][j] == 1) paths[i][j] = 0;
                    continue;
                }
                if(j==0) {
                    paths[i][j] = paths[i-1][j];
                    if(room[i][j] == 1) paths[i][j] = 0;
                    continue;
                }
                paths[i][j] = paths[i][j-1] + paths[i-1][j];
                if(room[i][j] == 1) paths[i][j] = 0;
            }
        }
        userEscapeRoomData[msg.sender].currentPaths = paths[2][2];
    }

    function getBoard() external view returns(uint) {
        return userEscapeRoomData[msg.sender].prevObstacle;
    }

    function getPaths() external view returns(uint) {
        return userEscapeRoomData[msg.sender].currentPaths;
    }

}
