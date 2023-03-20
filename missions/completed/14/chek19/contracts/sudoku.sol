pragma solidity ^0.8.0;

contract Sudoku {
  mapping(address => bool) public didThePlayerWin;
  uint[9][9] public puzzle= [[0, 0, 0, 0, 0, 0, 0, 0, 8],
        [1, 8, 0, 0, 0, 2, 3, 0, 0],
        [0, 6, 0, 0, 5, 7, 0, 0, 1],
        [0, 7, 0, 9, 6, 0, 0, 0, 0],
        [0, 9, 0, 7, 0, 4, 0, 1, 0],
        [0, 0, 0, 0, 8, 1, 0, 4, 0],
        [6, 0, 0, 2, 4, 0, 0, 8, 0],
        [0, 0, 4, 5, 0, 0, 0, 9, 3],
        [5, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    uint[9][9] public solved;
       uint[2][54]  tempArray = [  [ 0, 0 ], [ 0, 1 ], [ 0, 2 ], [ 0, 3 ],
  [ 0, 4 ], [ 0, 5 ], [ 0, 6 ], [ 0, 7 ],
  [ 1, 2 ], [ 1, 3 ], [ 1, 4 ], [ 1, 7 ],
  [ 1, 8 ], [ 2, 0 ], [ 2, 2 ], [ 2, 3 ],
  [ 2, 6 ], [ 2, 7 ], [ 3, 0 ], [ 3, 2 ],
  [ 3, 5 ], [ 3, 6 ], [ 3, 7 ], [ 3, 8 ],
  [ 4, 0 ], [ 4, 2 ], [ 4, 4 ], [ 4, 6 ],
  [ 4, 8 ], [ 5, 0 ], [ 5, 1 ], [ 5, 2 ],
  [ 5, 3 ], [ 5, 6 ], [ 5, 8 ], [ 6, 1 ],
  [ 6, 2 ], [ 6, 5 ], [ 6, 6 ], [ 6, 8 ],
  [ 7, 0 ], [ 7, 1 ], [ 7, 4 ], [ 7, 5 ],
  [ 7, 6 ], [ 8, 1 ], [ 8, 2 ], [ 8, 3 ],
  [ 8, 4 ], [ 8, 5 ], [ 8, 6 ], [ 8, 7 ],
  [ 8, 8 ]];

    function solveSudoku() public{
      require( didThePlayerWin[msg.sender]!=true,"alreadycomputed");
      uint[2][54] memory emptyCells= tempArray;
      uint[9][9] memory puzzle1=puzzle; 
      uint[2] memory data;
      unchecked{
      for(uint i=0;i<54;){
          data=emptyCells[i];
          uint value=puzzle1[data[0]][data[1]]+1;
          if(value>9){
              puzzle1[data[0]][data[1]]=0;
              i=i-1;
          }else if(isValid(puzzle1,data[0],data[1],value)){
           puzzle1[data[0]][data[1]]=value;
           i=i+1;
          }else{
              puzzle1[data[0]][data[1]]=value;
          }

      }
      }
      didThePlayerWin[msg.sender] = true;
      solved=puzzle1;
    }

    function isValid(uint[9][9] memory puzzle1,uint row, uint col, uint value) public pure returns(bool) {
  // Check row
  unchecked{
  for (uint i = 0; i < 9; i++) {
    if (puzzle1[row][i] == value) {
      return false;
    }
  }

  // Check column
  for (uint i = 0; i < 9; i++) {
    if (puzzle1[i][col] == value) {
      return false;
    }
  }

  // Check 3x3 box
  uint boxRow = (row / 3) * 3;
  uint boxCol = (col / 3) * 3;
  for (uint i = boxRow; i < boxRow + 3; i++) {
    for (uint j = boxCol; j < boxCol + 3; j++) {
      if (puzzle1[i][j] == value) {
        return false;
      }
    }
  }
  }
  return true;
}
function board(address sender) public view returns(uint[9][9] memory){
  if(didThePlayerWin[sender]){
   return solved;
  }
  return puzzle;
}

}
