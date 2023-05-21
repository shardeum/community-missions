// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SpiralOrder {
    uint8[4][3] public water = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];

    function spiralClockwise() public view returns (uint256[12] memory) {
        uint256 top = 0;
        uint256 bottom = 2;
        uint256 left = 0;
        uint256 right = 3;
        uint256 direction = 0;
        uint256[12] memory spiral;
        uint256 index = 0;

        while (top <= bottom && left <= right) {
            if (direction == 0) {
                for (uint256 col = left; col <= right; col++) {
                    spiral[index] = water[top][col];
                    index++;
                }
                top++;
            } else if (direction == 1) {
                for (uint256 row = top; row <= bottom; row++) {
                    spiral[index] = water[row][right];
                    index++;
                }
                right--;
            } else if (direction == 2) {
                for (uint256 col = right; col > left; col--) {
                    spiral[index] = water[bottom][col];
                    index++;
                }
                bottom--;
            } else if (direction == 3) {
                for (uint256 row = bottom + 1; row >= top; row--) {
                    spiral[index] = water[row][left];
                    index++;
                }
                left++;
            }

            direction = (direction + 1) % 4;
        }

        return spiral;
    }

    function useSpiral() public view returns (uint256[12] memory) {
        uint256[12] memory spiral = spiralClockwise();
        uint256 lastElement = spiral[spiral.length - 1];

        for (uint256 i = spiral.length - 1; i > 0; i--) {
            spiral[i] = spiral[i - 1];
        }

        spiral[0] = lastElement;
        return spiral;
    }

    function unspiralClockwise() public {
        uint256 top = 0;
        uint256 bottom = 2;
        uint256 left = 0;
        uint256 right = 3;
        uint256 direction = 0;
        uint256 index = 0;
        uint256[12] memory spiral = useSpiral();

        while (top <= bottom && left <= right) {
            if (direction == 0) {
                for (uint256 col = left; col <= right; col++) {
                    water[top][col] = uint8(spiral[index]);
                    index++;
                }
                top++;
            } else if (direction == 1) {
                for (uint256 row = top; row <= bottom; row++) {
                    water[row][right] = uint8(spiral[index]);
                    index++;
                }
                right--;
            } else if (direction == 2) {
                for (uint256 col = right; col > left; col--) {
                    water[bottom][col] = uint8(spiral[index]);
                    index++;
                }
                bottom--;
            } else if (direction == 3) {
                for (uint256 row = bottom + 1; row >= top; row--) {
                    water[row][left] = uint8(spiral[index]);
                    index++;
                }
                left++;
            }

            direction = (direction + 1) % 4;
        }
    }

    function spiralCounterClockwise() public view returns (uint256[12] memory) {
        uint256 top = 0;
        uint256 bottom = 2;
        uint256 left = 0;
        uint256 right = 3;
        uint256 direction = 0;
        uint256[12] memory spiral;
        uint256 index = 0;

        while (top <= bottom && left <= right) {
            if (direction == 0) {
                for (uint256 col = right; col > left; col--) {
                    spiral[index++] = water[top][col];
                }
                top++;
            } else if (direction == 1) {
                for (uint256 row = top - 1; row <= bottom; row++) {
                    spiral[index++] = water[row][left];
                }
                left++;
            } else if (direction == 2) {
                for (uint256 col = left; col <= right; col++) {
                    spiral[index++] = water[bottom][col];
                }
                bottom--;
            } else if (direction == 3) {
                for (uint256 row = bottom; row >= top; row--) {
                    spiral[index++] = water[row][right];
                }
                right--;
            }

            direction = (direction + 1) % 4;
        }
        spiral[11] = water[1][1];

        return spiral;
    }

    function useSpiralCounter() public view returns (uint256[12] memory) {
        uint256[12] memory spiral = spiralCounterClockwise();
        uint256 lastElement = spiral[spiral.length - 1];

        for (uint256 i = spiral.length - 1; i > 0; i--) {
            spiral[i] = spiral[i - 1];
        }

        spiral[0] = lastElement;
        return spiral;
    }

    function unspiralCounterClockwise() public {
        uint256 top = 0;
        uint256 bottom = 2;
        uint256 left = 0;
        uint256 right = 3;
        uint256 direction = 0;
        uint256[12] memory spiral = useSpiralCounter();
        uint256 index = 0;

        while (top <= bottom && left <= right) {
            if (direction == 0) {
                for (uint256 col = right; col > left; col--) {
                    water[top][col] = uint8(spiral[index++]);
                }
                top++;
            } else if (direction == 1) {
                for (uint256 row = top - 1; row <= bottom; row++) {
                    water[row][left] = uint8(spiral[index++]);
                }
                left++;
            } else if (direction == 2) {
                for (uint256 col = left; col <= right; col++) {
                    water[bottom][col] = uint8(spiral[index++]);
                }
                bottom--;
            } else if (direction == 3) {
                for (uint256 row = bottom; row >= top; row--) {
                    water[row][right] = uint8(spiral[index++]);
                }
                right--;
            }

            direction = (direction + 1) % 4;
        }
        water[1][1] = uint8(spiral[11]);
    }

    function getWater() public view returns (uint8[4][3] memory) {
        return water;
    }
}
