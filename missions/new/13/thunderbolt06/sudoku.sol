// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.12;

contract PlaySudoku {
    event d(uint _i);
    mapping (address => bool) didThePlayerWin;
    uint[9][9] public currentBoard = [[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]];
    uint[2] xc = [0,1];
    uint[2] yc = [0,1];

    function getDidThePlayerWin() public view returns(bool) {
        return didThePlayerWin[msg.sender];
    }

    function getCurrentBoard() public view returns(uint[9][9] memory) {
        uint[9][9] memory makeBoard = currentBoard;
        for (uint i=0;i<9;i++){
            for (uint j=0;j<9;j++){
                if(i==xc[0] && j==yc[0]){
                    makeBoard[i][j] = 0;
                }
                if(i==xc[1] && j==yc[1]){
                    makeBoard[i][j] = 0;
                }
            }
        }
        return makeBoard;
    }

    function checkRepeat(uint x, uint y, uint[9][9] memory ansBoard) internal returns(bool) {
        // Row
        uint rowMask = 0;
        for (uint i=0;i<9;i++) {
            rowMask += 1 << (ansBoard[x][i]-1);
        }
        emit d(rowMask);
        emit d((1<<10)-1);
        if(rowMask != ((1<<9)-1)) return true;
        // Column
        uint colMask = 0;
        for (uint i=0;i<9;i++) {
            colMask += 1 << (ansBoard[i][y]-1);
        }
        emit d(colMask);
        if(colMask != ((1<<9)-1)) return true;
        // Square
        uint sqMask = 0;
        uint rr = x/3;
        uint cc = y/3;
        for (uint i=rr*3;i<rr*3+3;i++) {
            for(uint j=cc*3;j<cc*3+3;j++) {
                sqMask += 1 << (ansBoard[i][j]-1);
            }
        }
        emit d(sqMask);
        if(sqMask != ((1<<9)-1)) return true;
        return false;
    }

    function verifyWin(uint x1, uint y1, uint inp1, uint x2, uint y2, uint inp2) public returns(bool) {

        if(inp1 == 0 || inp2 == 0) {
            didThePlayerWin[msg.sender] = false;
            return false;
        }
        uint[9][9] memory ansBoard = currentBoard;
        ansBoard[x1][y1] = inp1;
        ansBoard[x2][y2] = inp2;
        
        bool ans = checkRepeat(x1, y1, ansBoard) || checkRepeat(x2, y2, ansBoard);
        didThePlayerWin[msg.sender] = !ans;
        return !ans;
    }
}
