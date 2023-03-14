pragma solidity ^0.8.0;

contract PlaySudoku {
    uint8[9][9] public originalBoard = [[5, 3, 4, 6, 7, 8, 9, 1, 2],
 [6, 7, 2, 1, 9, 5, 3, 4, 8],
 [1, 9, 8, 3, 4, 2, 5, 6, 7],
 [8, 5, 9, 7, 6, 1, 4, 2, 3],
 [4, 2, 6, 8, 5, 3, 7, 9, 1],
 [7, 1, 3, 9, 2, 4, 8, 5, 6],
 [9, 6, 1, 5, 3, 7, 2, 8, 4],
 [2, 8, 7, 4, 1, 9, 0, 3, 5],
 [3, 4, 5, 2, 8, 6, 1, 7, 0]];
    uint8 public emptyCount;
    mapping(address => bool) public didThePlayerWin;

    
function isValidSudoku(uint8 row, uint8 col, uint8 num, uint8[9][9] memory newBoard ) public view returns (bool) {
  for (uint8 i = 0; i < 9; i++) {
    if ((i != col && newBoard[row][i] == num) || (i != row && newBoard[i][col] == num)) {
      return false;
    }
  }
  uint8 boxRow = row - row % 3;
  uint8 boxCol = col - col % 3;
  for (uint8 i = 0; i < 3; i++) {
    for (uint8 j = 0; j < 3; j++) {
      if ( (((boxRow + i) != row) && ((boxCol + j) != col)) && newBoard[boxRow + i][boxCol + j] == num) {
        return false;
      }
    }
  }
  return true;
}


    function verifyWin(uint8[9][9] memory newBoard) public {
      didThePlayerWin[msg.sender] = true;
        for (uint8 i = 0; i < 9; i++) {
            for (uint8 j = 0; j < 9; j++) {
                if (!isValidSudoku(i, j, newBoard[i][j], newBoard) || newBoard[i][j] == 0) {
                     didThePlayerWin[msg.sender] = false;
                     break;
                } 
            }
        }
        
    }
    
    function getBoard() public view returns (uint8[9][9] memory) {
        return originalBoard;
    }

    function resetWin() public {
        didThePlayerWin[msg.sender] = false;
    }

    
}
    