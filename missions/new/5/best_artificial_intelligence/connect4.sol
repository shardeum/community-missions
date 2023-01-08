// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract connect {
    // Struct to store player state
    struct PlayerState {
        uint[7][7] boardState;
        uint8 playerWins;
        uint8 computerWins;
        uint8 tiedGames;
    }

    // Mapping from player addresses to player states
    mapping(address => PlayerState) public playerStates;

    // Function to start a new game
    function newGame() public {
        playerStates[msg.sender].boardState = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ];
    }

    //colum insertion checking
    // function is_valid_location(uint8[6][7] memory board,uint8 col) internal pure returns(bool){
    //   bool value=board[5][col]==0;
    //   return value;
    // }

    function get_next_open_row(
        uint[7][7] memory board,
        uint col
    ) internal pure returns (uint8) {
        for (uint8 i = 0; i < 6; ) {
            if (board[i][col] == 0) {
                return i;
            }
            unchecked {
                i++;
            }
        }
        return 0;
    }

    function drop_piece(
        address sender,
        uint row,
        uint col,
        uint piece
    ) internal {
        playerStates[sender].boardState[row][col] = piece;
    }

    function winning_move(
        uint[7][7] memory board,
        uint piece
    ) internal pure returns (bool) {
        //horizonatal check
        unchecked {
            for (uint c = 0; c < 4; c++) {
                if (
                    (board[0][c] == piece &&
                        board[0][c + 1] == piece &&
                        board[0][c + 2] == piece &&
                        board[0][c + 3] == piece) ||
                    (board[1][c] == piece &&
                        board[1][c + 1] == piece &&
                        board[1][c + 2] == piece &&
                        board[1][c + 3] == piece) ||
                    (board[2][c] == piece &&
                        board[2][c + 1] == piece &&
                        board[2][c + 2] == piece &&
                        board[2][c + 3] == piece) ||
                    (board[3][c] == piece &&
                        board[3][c + 1] == piece &&
                        board[3][c + 2] == piece &&
                        board[3][c + 3] == piece) ||
                    (board[4][c] == piece &&
                        board[4][c + 1] == piece &&
                        board[4][c + 2] == piece &&
                        board[4][c + 3] == piece) ||
                    (board[5][c] == piece &&
                        board[5][c + 1] == piece &&
                        board[5][c + 2] == piece &&
                        board[5][c + 3] == piece)
                ) {
                    return true;
                }
            }
            //vertical check
            for (uint c = 0; c < 7; c++) {
                if (
                    (board[0][c] == piece &&
                        board[1][c] == piece &&
                        board[2][c] == piece &&
                        board[3][c] == piece) ||
                    (board[1][c] == piece &&
                        board[2][c] == piece &&
                        board[3][c] == piece &&
                        board[4][c] == piece) ||
                    (board[2][c] == piece &&
                        board[3][c] == piece &&
                        board[4][c] == piece &&
                        board[5][c] == piece)
                ) {
                    return true;
                }
            }

            //positive slope diagonal
            for (uint c = 0; c < 4; c++) {
                if (
                    (board[0][c] == piece &&
                        board[1][c + 1] == piece &&
                        board[2][c + 2] == piece &&
                        board[3][c + 3] == piece) ||
                    (board[1][c] == piece &&
                        board[2][c + 1] == piece &&
                        board[3][c + 2] == piece &&
                        board[4][c + 3] == piece) ||
                    (board[2][c] == piece &&
                        board[3][c + 1] == piece &&
                        board[4][c + 2] == piece &&
                        board[5][c + 3] == piece)
                ) {
                    return true;
                }
            }

            //negative diagonal
            for (uint c = 0; c < 4; c++) {
                if (
                    (board[3][c] == piece &&
                        board[2][c + 1] == piece &&
                        board[1][c + 2] == piece &&
                        board[0][c + 3] == piece) ||
                    (board[4][c] == piece &&
                        board[3][c + 1] == piece &&
                        board[2][c + 2] == piece &&
                        board[1][c + 3] == piece) ||
                    (board[5][c] == piece &&
                        board[4][c + 1] == piece &&
                        board[3][c + 2] == piece &&
                        board[2][c + 3] == piece)
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function count(uint[7] memory board) internal pure returns (uint) {
        uint count1 = 0;
        for (uint i = 0; i < 7; ) {
            if (board[i] == 1) {
                unchecked {
                    count1++;
                }
            }
            unchecked {
                i++;
            }
        }
        return count1;
    }

    function get_valid_locations(
        uint[7][7] memory board
    ) internal pure returns (uint[7] memory) {
        uint[7] memory state;
        for (uint i = 0; i < 7; ) {
            if (board[5][i] == 0) {
                state[i] = 1;
            }
            unchecked {
                i++;
            }
        }
        return state;
    }

    function is_terminal_node(
        uint[7][7] memory board
    ) internal pure returns (bool) {
        return
            winning_move(board, 1) ||
            winning_move(board, 2) ||
            count(get_valid_locations(board)) == 0;
    }

    function eval_count(
        uint[4] memory board,
        uint piece
    ) internal pure returns (uint8) {
        uint8 count1 = 0;
        for (uint8 i = 0; i < 4; ) {
            if (board[i] == piece) {
                unchecked {
                    count1 = count1 + 1;
                }
            }
            unchecked {
                i++;
            }
        }
        return count1;
    }

    function evaluate_window(
        uint[4] memory board,
        uint piece
    ) internal pure returns (int) {
        int score = 0;
        uint opp_piece = 1;
        unchecked {
            if (piece == opp_piece) {
                opp_piece = 2;
            }

            if (eval_count(board, piece) == 4) {
                score += 100;
            } else if (
                eval_count(board, piece) == 3 && eval_count(board, 0) == 1
            ) {
                score += 5;
            } else if (
                eval_count(board, piece) == 2 && eval_count(board, 0) == 2
            ) {
                score += 2;
            }
            if (
                eval_count(board, opp_piece) == 3 && eval_count(board, 0) == 1
            ) {
                score -= 4;
            }
        }
        return score;
    }

    function score_position(
        uint[7][7] memory board,
        uint piece
    ) internal pure returns (int) {
        //center score
        int score = 0;
        int count2 = 0;
        unchecked {
            for (uint i = 0; i < 6; i++) {
                if (board[i][3] == piece) {
                    count2 = count2 + 1;
                }
            }
            score += count2 * 3;
            //score horizonatal
            uint[4] memory window;
            for (uint r = 0; r < 6; r++) {
                for (uint c = 0; c < 4; c++) {
                    window = [
                        board[r][c],
                        board[r][c + 1],
                        board[r][c + 2],
                        board[r][c + 3]
                    ];
                    score += evaluate_window(window, piece);
                }
            }

            //score vertical
            for (uint c = 0; c < 7; c++) {
                for (uint r = 0; r < 3; r++) {
                    window = [
                        board[r][c],
                        board[r + 1][c],
                        board[r + 2][c],
                        board[r + 3][c]
                    ];
                    score += evaluate_window(window, piece);
                }
            }
            for (uint r = 0; r < 3; r++) {
                for (uint c = 0; c < 3; c++) {
                    window = [
                        board[r][c],
                        board[r + 1][c + 1],
                        board[r + 2][c + 2],
                        board[r + 3][c + 3]
                    ];
                    score += evaluate_window(window, piece);
                }
            }
            for (uint r = 0; r < 3; r++) {
                for (uint c = 0; c < 3; c++) {
                    window = [
                        board[r + 3][c],
                        board[r + 2][c + 1],
                        board[r + 1][c + 2],
                        board[r][c + 3]
                    ];
                    score += evaluate_window(window, piece);
                }
            }
        }

        return score;
    }

    function minimax(
        uint[7][7] memory board,
        uint8 depth,
        int alpha,
        int beta,
        bool maximizingPlayer
    ) public returns (uint8, int) {
        unchecked {
            bool is_terminal = is_terminal_node(board);
            int new_score;
            if (depth == 0 || is_terminal) {
                if (is_terminal) {
                    if (winning_move(board, 2)) {
                        return (0, 10);
                    } else if (winning_move(board, 1)) {
                        return (0, -10);
                    } else {
                        return (0, 0);
                    }
                } else {
                    return (0, score_position(board, 2));
                }
            }
            if (maximizingPlayer) {
                int value = -100;
                uint8 column = 0;
                for (uint8 col = 0; col < 7; col++) {
                    if (board[5][col] == 0) {
                        uint8 row = get_next_open_row(board, col);
                        board[row][col] = 2;
                        (, new_score) = minimax(
                            board,
                            depth - 1,
                            alpha,
                            beta,
                            false
                        );
                        board[row][col] = 0;
                        if (new_score > value) {
                            value = new_score;
                            column = col;
                        }
                        alpha = alpha > value ? alpha : value;
                        if (alpha >= beta) {
                            break;
                        }
                    }
                }
                return (column, value);
            } else {
                int value = 100;
                uint8 column = 0;
                for (uint8 col = 0; col < 7; col++) {
                    if (board[5][col] == 0) {
                        uint8 row = get_next_open_row(board, col);
                        board[row][col] = 1;
                        (, new_score) = minimax(
                            board,
                            depth - 1,
                            alpha,
                            beta,
                            true
                        );
                        board[row][col] = 0;
                        if (new_score < value) {
                            value = new_score;
                            column = col;
                        }
                        beta = beta < value ? beta : value;
                        if (alpha >= beta) {
                            break;
                        }
                    }
                }
                return (column, value);
            }
        }
    }

    //function make move
    function makeMove(uint8 column) public {
        require(
            playerStates[msg.sender].boardState[5][column] == 0,
            "no empty spaces"
        );
        uint8 row = get_next_open_row(
            playerStates[msg.sender].boardState,
            column
        );
        playerStates[msg.sender].boardState[row][column] = 1;

        if (winning_move(playerStates[msg.sender].boardState, 1)) {
            playerStates[msg.sender].playerWins++;
            newGame();
        } else if (is_terminal_node(playerStates[msg.sender].boardState)) {
            playerStates[msg.sender].tiedGames++;
            newGame();
        } else {
            (uint8 col, ) = minimax(
                playerStates[msg.sender].boardState,
                2,
                -100,
                100,
                true
            );
            row = get_next_open_row(playerStates[msg.sender].boardState, col);
            playerStates[msg.sender].boardState[row][col] = 2;
            if (winning_move(playerStates[msg.sender].boardState, 2)) {
                playerStates[msg.sender].computerWins++;
                newGame();
            } else if (is_terminal_node(playerStates[msg.sender].boardState)) {
                playerStates[msg.sender].tiedGames++;
                newGame();
            }
        }
    }

    function showBoard(address sender) public view returns (uint[7][7] memory) {
        return playerStates[sender].boardState;
    }
}
