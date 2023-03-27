// SPDX-License-Identifier: GPL

pragma solidity ^0.8.9;

contract EscapeTheRoom{
    struct userEscapeRoomData{
        uint currentBlockTime;
        uint[3][3] currentRoomCoordinates;
        uint currentPaths;
    }

    mapping(address => userEscapeRoomData) escapeRoomData;

    constructor(){}
    event str(
        string a
    );
    event num(
        uint a
    );

    function generateNewBoard() external{
        uint8[3][3] memory currentRoom;
        uint time = block.timestamp;
        escapeRoomData[msg.sender].currentBlockTime = time;
        uint determinant = (time % 7) + 2;
        emit str("hello");
        uint i = 0;
        uint j = 1;
        uint count = 2;
        while(i < 3){
            j=0;
            while(j < 3){
                if(determinant == count){
                    currentRoom[i][j] = 1;
                }
                j+=1;
                count+=1;
            }
            i+=1;
        }

        escapeRoomData[msg.sender].currentRoomCoordinates = currentRoom;
        emit num(determinant);
        escapeRoomData[msg.sender].currentPaths = 0;
    }

    function getCurrentPaths() public view returns (uint){
        return escapeRoomData[msg.sender].currentPaths;
    }
    function getCurrentRoom() public view returns (userEscapeRoomData memory){
        return escapeRoomData[msg.sender];
    }
    function computePathsCurrentBoard() external {
        uint i = 0;
        uint j = 1;
        uint[3][3] currentRoom = escapeRoomData[msg.sender].currentRoomCoordinates;
        
        uint[4][4] dp;
        for(int i=0 ; i<3 ; i++){
            if(currentRoom[i][0]==1){
                break;
            }
            dp[i][0] = 1;
        }
        for(int j=0 ; j<3 ; j++){
            if(currentRoom[0][j]==1){
                break;
            }
            dp[0][j] = 1;
        }

        for(uint i=1;i<3;i++){
            for(uint j=1;j<3;j++){

                if(currentRoom[i][j]!=1){
                    dp[i][j] = (dp[i-1][j] + dp[i][j-1]);
                }
            }
        }
        escapeRoomData[msg.sender].currentPaths = dp[2][2];
    }
    
}