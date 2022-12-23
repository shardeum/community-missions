// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Encode {
    struct PlayerState {
        uint8[9] boardState;
        uint playerWins;
        uint computerWins;
        uint tiedGames;
    }
    mapping(address => PlayerState) public playerStates;

    function newGame() public {
        address player = msg.sender;
        playerStates[player].boardState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    function check(uint8[9] memory board) internal pure returns (uint8) {
        uint8 count = 0;
        for (uint8 i = 0; i < 9; i++) {
            if (board[i] == 0) {
                count = count + 1;
            }
        }
        return count;
    }

    function makeMove(uint8 x) public {
        address player = msg.sender;
        require(playerStates[player].boardState[x] == 0, "Cell is not empty");

        playerStates[player].boardState[x] = 1;
        if (check(playerStates[player].boardState) == 8) {
            if (playerStates[player].boardState[4] == 0) {
                playerStates[player].boardState[4] = 2;
            } else {
                playerStates[player].boardState[0] = 2;
            }
        } else if (is_win(playerStates[player].boardState, 2)) {
            playerStates[player].computerWins++;
        } else if (is_win(playerStates[player].boardState, 1)) {
            playerStates[player].playerWins++;
        } else if (check(playerStates[player].boardState) == 0) {
            playerStates[player].tiedGames++;
        } else {
            aimove(player);
        }
    }

    function aimove(address sender) internal {
        PlayerState storage playerState = playerStates[sender];
        uint8[9] memory board = playerState.boardState;
        int best_score = -100;
        uint8 best_pos = 0;
        int score;
        for (uint8 i = 0; i < 9; i++) {
            if (board[i] == 0) {
                board[i] = 2;
                score = minimax(board, false, -10, 10);
                board[i] = 0;
                if (score > best_score) {
                    best_score = score;
                    best_pos = i;
                }
            }
        }
        playerState.boardState[best_pos] = 2;
        if (is_win(playerStates[sender].boardState, 2)) {
            playerStates[sender].computerWins++;
        } else if (is_win(playerStates[sender].boardState, 1)) {
            playerStates[sender].playerWins++;
        } else if (check(playerStates[sender].boardState) == 0) {
            playerStates[sender].tiedGames++;
        }
    }

    function minimax(
        uint8[9] memory board,
        bool is_maximizing,
        int alpha,
        int beta
    ) public returns (int) {
        if (is_win(board, 2)) {
            return 10;
        } else if (is_win(board, 1)) {
            return -10;
        } else if (check(board) == 0) {
            return 0;
        }
        if (is_maximizing) {
            int best_score = -100;
            int score;
            for (uint8 i = 0; i < 9; i++) {
                if (board[i] == 0) {
                    board[i] = 2;
                    score = minimax(board, false, alpha, beta);
                    board[i] = 0;
                    best_score = score >= best_score ? score : best_score;
                    alpha = alpha > score ? alpha : score;
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return best_score;
        } else {
            int best_score = 100;
            int score;
            for (uint8 i = 0; i < 9; i++) {
                if (board[i] == 0) {
                    board[i] = 1;
                    score = minimax(board, true, alpha, beta);
                    board[i] = 0;
                    best_score = score <= best_score ? score : best_score;
                    beta = beta < score ? beta : score;
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
            return best_score;
            //end
        }
    }

    function is_win(
        uint8[9] memory board,
        uint8 letter
    ) internal pure returns (bool) {
        if (board[0] == letter && board[1] == letter && board[2] == letter) {
            return true;
        } else if (
            board[3] == letter && board[4] == letter && board[5] == letter
        ) {
            return true;
        } else if (
            board[6] == letter && board[7] == letter && board[8] == letter
        ) {
            return true;
        } else if (
            board[0] == letter && board[3] == letter && board[6] == letter
        ) {
            return true;
        } else if (
            board[1] == letter && board[4] == letter && board[7] == letter
        ) {
            return true;
        } else if (
            board[2] == letter && board[5] == letter && board[8] == letter
        ) {
            return true;
        } else if (
            board[0] == letter && board[4] == letter && board[8] == letter
        ) {
            return true;
        } else if (
            board[2] == letter && board[4] == letter && board[6] == letter
        ) {
            return true;
        } else {
            return false;
        }
    }

    function showBoard(address sender) public view returns (uint8[9] memory) {
        PlayerState storage playerState = playerStates[sender];
        // playerState.boardState[1]="x";
        return (playerState.boardState);
    }
}
