// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract SpiralMatrix {
    uint256[][] private matrix = new uint256[][](4);

    uint256 private constant size = 12;

    constructor() {
        reset();
    }

    function spiralClockwise() external  {
            uint256 rowStart;
            uint256 colStart;

            uint256 rowEnd = 2;
            uint256 colEnd = 3;
            uint256 prev = matrix[0][0];

            while (true) {
                if (colStart > colEnd) break;

                // Change rowStart row
                for (uint256 i = colStart; i <= colEnd; ++i) {
                    (matrix[rowStart][i], prev) = (prev, matrix[rowStart][i]);
                }

                ++rowStart;

                if (rowStart > rowEnd) break;

                // Change colEnd column
                for (uint256 i = rowStart; i <= rowEnd; ++i) {
                    (matrix[i][colEnd], prev) = (prev, matrix[i][colEnd]);
                }

                --colEnd;

                if (colStart > colEnd) break;

                // Change rowEnd row
                for (uint256 i = colEnd; i >= colStart; --i) {
                    (matrix[rowEnd][i], prev) = (prev, matrix[rowEnd][i]);
                    if (i==0) break;
                }

                --rowEnd;

                if (rowStart > rowEnd) break;

                // Change colStart column
                for (uint256 i = rowEnd; i >= rowStart; --i) {
                    (matrix[i][colStart], prev) = (prev, matrix[i][colStart]);
                    if (i==0) break;
                }

                ++colStart;
            }

            // The first element of the matrix will be the last element replaced
            matrix[0][0] = prev;
    }

    function spiralCounterClockwise() external {
            uint256 rowStart;
            uint256 colStart;

            uint256 rowEnd = 2;
            uint256 colEnd;
            uint256 prev = matrix[0][3];

            while (true) {
                if (colStart < colEnd) break;

                // Change colStart column
                for (uint256 i = colStart; i >= colEnd; --i) {
                    (matrix[rowStart][i], prev) = (prev, matrix[rowStart][i]);
                    if (i==0) break;
                }

                ++rowStart;

                if (rowStart > rowEnd) break;

                // Change rowEnd row
                for (uint256 i = rowStart; i <= rowEnd; ++i) {
                    (matrix[i][colEnd], prev) = (prev, matrix[i][colEnd]);
                }

                ++colEnd;

                if (colStart < colEnd) break;

                // Change colEnd column
                for (uint256 i = colEnd; i <= colStart; ++i) {
                    (matrix[rowEnd][i], prev) = (prev, matrix[rowEnd][i]);
                }

                --rowEnd;

                if (rowStart > rowEnd) break;

                // Change rowStart row
                for (uint256 i = rowEnd; i >= rowStart; --i) {
                    (matrix[i][colStart], prev) = (prev, matrix[i][colStart]);
                    if (i==0) break;
                }

                --colStart;
            }

            // The first element of the matrix will be the last element replaced
            matrix[0][3] = prev;
    }

    function reset() public {
        matrix = [  [1, 2, 3, 4],
                    [5, 6, 7, 8],
                    [9, 10, 11, 12]
                ];
    }

    function getMatrix() external view returns (uint256[][] memory) {
        return matrix;
    }
}