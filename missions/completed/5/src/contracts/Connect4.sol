// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract Connect4{
    uint8 ROW_COUNT = 6;
    uint8 COL_COUNT = 7;
    uint8 WINDOW_LENGTH = 4;
    uint8 PLAYER_PIECE = 1;
    uint8 AI_PIECE = 2;
    uint8 EMPTY_PIECE = 0;
    int MATH_INF = 100000;
    struct PlayerStates{
        uint8[7][6] boardState;
        uint8 playerWins;
        uint8 computerWins;
        uint8 tiedGames;
        string message;
    }
    mapping(address => PlayerStates) gameState;

    function getGameState() external view returns(PlayerStates memory){
        return gameState[msg.sender];
    }

    function _recordMove(uint8[7][6] memory board, uint8 row, uint8 col, uint8 player) private pure returns (uint8[7][6] memory){
        board[row][col] = player;
        return board;
    }
    
    function _checkColEmpty(uint8[7][6] memory board, uint8 col) private view returns (bool){
        if(board[ROW_COUNT - 1][col] == 0){
            return true;
        }
        return false;
    }

    function _getEmptyRow(uint8[7][6] memory board, uint8 col) private view returns (uint8 row){
        for(uint8 i = 0; i < ROW_COUNT; i++){
            if(board[i][col] == 0){
                row = i;
                break;
            }
        }
        return row;
    }

    function _gameOver(uint8[7][6] memory board) private view returns (bool gameover){
        gameover = true;
        for(uint8 i = 0; i < ROW_COUNT; i++){
            for(uint8 j = 0; j < COL_COUNT; j++){
                if(board[i][j] == 0){
                    gameover = false;
                    break;
                }
            }
        }
        return gameover;
    }

    function _max(int a, int b) private pure returns (int){
        return a > b ? a : b;
    }

    function _min(int a, int b) private pure returns (int){
        return a < b ? a : b;
    }

    function _checkIfWon(uint8[7][6] memory board, uint8 playerIndex) private view returns (bool){
        for(uint8 i = 0; i < ROW_COUNT; i++){
            for(uint8 j = 0; j < COL_COUNT - 3; j++){
                bool win = true;
                for(uint8 k = j; k < j + 4; k++){
                    if(board[i][k] != playerIndex){
                        win = false;
                        break;
                    }
                }
                if(win == true){
                    return true;
                }
            }
        }
        for(uint8 i = 0; i < COL_COUNT; i++){
            for(uint8 j = 0; j < ROW_COUNT - 3; j++){
                bool win = true;
                for(uint8 k = j; k < j + 4; k++){
                    if(board[k][i] != playerIndex){
                        win = false;
                        break;
                    }
                }
                if(win == true){
                    return true;
                }
            }
        }
        for(uint8 i = 0; i < ROW_COUNT - 3; i++){
            for(uint8 j = 0; j < COL_COUNT - 3; j++){
                bool win = true;
                for(uint8 k = 0; k < WINDOW_LENGTH; k++){
                    if(board[i + k][j + k] != playerIndex){
                        win = false;
                        break;
                    }
                }
                if(win == true){
                    return true;
                }
            }
        }
        for(uint8 i = 0; i < ROW_COUNT - 3; i++){
            for(uint8 j = 3; j < COL_COUNT; j++){
                bool win = true;
                for(uint8 k = 0; k < WINDOW_LENGTH; k++){
                    if(board[i + k][j - k] != playerIndex){
                        win = false;
                        break;
                    }
                }
                if(win == true){
                    return true;
                }
            }
        }
        return false;
    }

    function _evaluateWindow(uint8[4] memory window, uint8 piece) private view returns (int score){
        score = 0;
        uint8 opp_piece = PLAYER_PIECE;
        if(piece == PLAYER_PIECE){
            opp_piece = AI_PIECE;
        }
        uint8 piece_count = 0;
        uint8 op_piece_count = 0;
        uint8 empty_count = 0;
        for(uint8 i = 0; i < WINDOW_LENGTH; i++){
            if(window[i] == piece){
                piece_count++;
            }
            else
            if(window[i] == opp_piece){
                op_piece_count++;
            }
            else
            if(window[i] == 0){
                empty_count++;
            }
        }
        if(piece_count == 4){
            score += 100;
        }
        else if(piece_count == 3 && empty_count == 1){
            score += 5;
        }
        else if(piece_count == 2 && empty_count == 2){
            score += 2;
        }
        
        if(op_piece_count == 3 && empty_count == 1){
            score -= 4;
        }
        return score;
    }

    function _scorePosition(uint8[7][6] memory board, uint8 piece) private view returns (int){
        // uint8[6] memory center_array;
        int score = 0;
        uint8 center_col = COL_COUNT / 2;
        for(uint8 i = 0; i < ROW_COUNT; i++){
            // center_array[i] = board[i][center_col];
            if(board[i][center_col] == piece){
                score++;
            }
        }
        score = score * 3;

        //horizontal score
        for(uint8 i = 0; i < ROW_COUNT; i++){
            for(uint8 j = 0; j < COL_COUNT - 3; j++){
                uint8 index = 0;
                uint8[4] memory window;
                for(uint8 k = j; k < j + WINDOW_LENGTH; k++){
                    window[index] = board[i][k];
                    index++;
                    score += _evaluateWindow(window, piece);
                }
            }
        }

        //vertical score
        for(uint8 i = 0; i < COL_COUNT; i++){
            for(uint8 j = 0; j < ROW_COUNT - 3; j++){
                uint8 index = 0;
                uint8[4] memory window;
                for(uint8 k = j; k < j + WINDOW_LENGTH; k++){
                    window[index] = board[k][i];
                    index++;
                    score += _evaluateWindow(window, piece);
                }
            }
        }

        //positive slope
        for(uint8 i = 0; i < ROW_COUNT - 3; i++){
            for(uint8 j = 0; j < COL_COUNT - 3; j++){
                uint8 index = 0;
                uint8[4] memory window;
                for(uint k = 0; k < WINDOW_LENGTH; k++){
                    window[index] = board[i + k][j + k];
                    index++;
                    score += _evaluateWindow(window, piece);
                }
            }
        }

        //negative slope
        for(uint8 i = 0; i < ROW_COUNT - 3; i++){
            for(uint8 j = 3; j < COL_COUNT; j++){
                uint8 index = 0;
                uint8[4] memory window;
                for(uint8 k = 0; k < WINDOW_LENGTH; k++){
                    window[index] = board[i + k][j - k];
                    index++;
                    score += _evaluateWindow(window, piece);
                }
            }
        }
        return score;
    }


    function _getValidColCount(uint8[7][6] memory board) private view returns (uint8 availColCount){
        for(uint8 i = 0; i < COL_COUNT; i++){
            if(board[5][i] == 0){
                availColCount++;
            }
        }
        return availColCount;
    }


    function _isTerminalNode(uint8[7][6] memory board) private view returns (bool){
        return (_checkIfWon(board, PLAYER_PIECE) || _checkIfWon(board, AI_PIECE) || _getValidColCount(board) == 0);
    }


    function _copyBoard(uint8[7][6] memory board) private view returns(uint8[7][6] memory newBoard){
        for(uint8 i = 0; i < ROW_COUNT; i++){
            for(uint8 j = 0; j < COL_COUNT; j++){
                newBoard[i][j] = board[i][j];
            }
        }
        return newBoard;
    }

    function _dropPiece(uint8[7][6] memory board, uint8 row, uint8 col, uint8 piece) private pure returns(uint8[7][6] memory){
        board[row][col] = piece;
        return board;
    }

    function _minimax(uint8[7][6] memory board, uint8 depth, int alpha, int beta, bool maximizingPlayer) internal returns (uint8, int){
        uint8 dpth = depth;
        uint8[7][6] memory bd_copy = board;
        int alph = alpha;
        int bta = beta;
        // uint[] memory validLocs = _getValidCols(bd_copy);
        bool isTerminal = _isTerminalNode(bd_copy);
        
        if(depth == 0 || isTerminal){
            if(isTerminal){
                if(_checkIfWon(bd_copy, AI_PIECE)){
                    return (0, 10000);
                }
                else
                if(_checkIfWon(bd_copy, PLAYER_PIECE)){
                    return (0, -10000);
                }
                else{
                    //gameover
                    return (0, 0);
                }
            }
            else{
                return (0, _scorePosition(bd_copy, AI_PIECE));
            }
        }

        if(maximizingPlayer){
            int value = -MATH_INF;
            uint8 column = 0;
            
            for(uint8 i = 0; i < COL_COUNT; i++){
                // uint col = validLocs[i];
                if(bd_copy[5][i] == 0){
                    uint8 row = _getEmptyRow(bd_copy, i);
                    uint8[7][6] memory boardCopy = _copyBoard(bd_copy);
                    boardCopy = _dropPiece(boardCopy, row, i, AI_PIECE);
                    (, int newScore) = _minimax(boardCopy, dpth - 1, alph, bta, false);
                    if(newScore > value){
                        value = newScore;
                        column = i;
                    }
                    alph = _max(alph, value);

                    if(alph >= bta){
                        break;
                    }
                }
            }
            return (column, value);
        }
        else{
            int value = MATH_INF;
            uint8 column = 0;

            for(uint8 i = 0; i < COL_COUNT; i++){
                // uint col = validLocs[i];
                if(bd_copy[5][i] == 0){
                    uint8 row = _getEmptyRow(bd_copy, i);
                    uint8[7][6] memory boardCopy = _copyBoard(bd_copy);
                    boardCopy = _dropPiece(boardCopy, row, i, PLAYER_PIECE);
                    (, int newScore) = _minimax(boardCopy, dpth - 1, alph, bta, true);

                    if(newScore < value){
                        value = newScore;
                        column = i;
                    }
                    bta = _min(bta, value);

                    if(alph >= bta){
                        break;
                    }
                }
            }
            return (column, value);
        }
    }

    function _setMessage(address player, string memory message) private{
        gameState[player].message = message;
    }

    function _aiMove(address player) private{
        uint8[7][6] memory bd_copy = _copyBoard(gameState[player].boardState);
        (uint8 col,) = _minimax(bd_copy, 2, -MATH_INF, MATH_INF, true);
        uint row = _getEmptyRow(bd_copy, col);
        gameState[player].boardState[row][col] = AI_PIECE;

        if(_checkIfWon(gameState[player].boardState, AI_PIECE)){
            gameState[player].computerWins++;
            _setMessage(player, "Computer Wins");
        }
        else
        if(_gameOver(gameState[player].boardState)){
            gameState[player].tiedGames++;
            _setMessage(player, "Game Tied");
            newGame();
        }
    }
    function playerMove(uint8 col) external returns (PlayerStates memory){
        _setMessage(msg.sender, "");
        require(gameState[msg.sender].boardState[5][0] == 0, "Invalid Move");
        uint8 row = _getEmptyRow(gameState[msg.sender].boardState, col);
        gameState[msg.sender].boardState[row][col] = PLAYER_PIECE;

        if(_checkIfWon(gameState[msg.sender].boardState, PLAYER_PIECE)){
            gameState[msg.sender].playerWins++;
            _setMessage(msg.sender, "Player Wins");
        }
        else
        if(_gameOver(gameState[msg.sender].boardState)){
            gameState[msg.sender].tiedGames++;
            _setMessage(msg.sender, "Game Tied");
            newGame();
        }
        else{
            _aiMove(msg.sender);
        }
        return gameState[msg.sender];
    }

    function newGame() public returns (PlayerStates memory){
        _setMessage(msg.sender, "");
        for(uint i = 0; i < ROW_COUNT; i++){
            for(uint j = 0; j < COL_COUNT; j++){
                gameState[msg.sender].boardState[i][j] = 0;
            }
        }
        return gameState[msg.sender];
    }

}