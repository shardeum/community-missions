// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

/**
 * @title Sudoku.
 */
contract Sudoku {

    // fixed sudoku board.
    uint256[9][9] private board = [
        [9,7,6,1,0,0,8,3,5],
        [8,1,4,0,9,0,7,6,2],
        [2,3,5,7,6,8,9,4,1],
        [0,9,0,8,0,0,6,5,3],
        [0,6,0,9,0,0,4,8,7],
        [0,4,8,0,0,6,1,2,9],
        [0,5,0,6,8,9,2,1,4],
        [4,8,9,2,0,0,5,7,6],
        [6,2,1,4,5,7,3,9,8]];
    // Stores the winning data of each user.
    mapping (address => bool) private didThePlayerWin;
    mapping (address => uint256[9][9]) private playersBoard;

    /**
     * @dev verify whether a user has completed the sudoku.
     */
    function verifyWin(uint256[9][9] memory _board) external {
        if(didThePlayerWin[msg.sender]) revert ProcessedAlready();
        if(!validateBoard(_board)) revert InvalidBoard();
        playersBoard[msg.sender] = _board;
        for(uint256 i; i != 9; ++i) {
            for(uint256 j; j != 9; ++j) {
                uint256 check = _board[i][j];
                _board[i][j] = 0;
                if(!validationConditions(_board,check,i,j)) revert InvalidBoard();
                _board[i][j] = check;
            }
        }
        didThePlayerWin[msg.sender] = true;
    }

    /**
     * @dev validate the board fillings.
     * condition 1: row check.
     * condition 2: col check.
     * condition 3: cubic check.
     */
    function validationConditions(uint256[9][9] memory _board, uint256 _check, uint256 _row, uint256 _col) private pure returns(bool) {
        for(uint256 i; i != 9; ++i) {
            if((_board[_row][i] == _check) || (_board[i][_col] == _check) || (_board[(3*(_row/3)+(i/3))][(3*(_col/3)+(i%3))] == _check)) return false;
        }
        return true;
    }

    /**
     * @dev validate the board state.
     * condition 1: whether the board was modified.
     * condition 2: whether the board has empty place.
     */
    function validateBoard(uint256[9][9] memory _board) private view returns(bool) {
        for(uint256 i; i != 9; ++i) {
            for(uint256 j; j != 9; ++j) {
                // modified board
                if(board[i][j] != 0) {
                    if(_board[i][j] != board[i][j]) return false;
                }
                // incomplete board
                if(_board[i][j] == 0) return false;
            }
        }
        return true;
    }

    /**
     * @dev returns the game board.
     */
    function getBoard() external view returns(uint256[9][9] memory _board){
        _board = board;
    }

    /**
     * @dev returns the winning state of an user.
     */
    function playerWon() external view returns(bool _won){
        _won = didThePlayerWin[msg.sender];
    }

    /**
     * @dev returns the completed game board.
     */
    function getSolvedBoard() external view returns(uint256[9][9] memory _board){
        if(!didThePlayerWin[msg.sender]) revert UnSolved();
        _board = playersBoard[msg.sender];
    }

    // Avoid re-computing the sudoku state.
    error ProcessedAlready();
    // Error on sudoku board.
    error InvalidBoard();
    // Player hasn't solved the board
    error UnSolved();
}