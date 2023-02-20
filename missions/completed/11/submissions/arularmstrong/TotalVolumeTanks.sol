// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

/**
 * @title Total Volume Tanks.
 */
contract TotalVolumeTanks {
    // Tank data
    struct userWaterTankData {
        uint64 currentBlockTime;
        uint8[9] currentTankWalls;
        uint16 totalTanks;
        uint32 currentWaterVolume;
        uint32 totalWaterVolume;
        uint8 isProcessed;
    }

    // Stores the tank data of each user.
    mapping (address => userWaterTankData) private user;

    /**
     * @dev Cretaed a new tank wall based on.
     * block timestamp and computes tank volume.
     */
    function createNewMap() external {
        // check previous tank computed.
        if (user[msg.sender].isProcessed == 0 && user[msg.sender].totalTanks != 0) revert TankUnprocessed();
        user[msg.sender].currentBlockTime = uint64(block.timestamp);
        uint256 height;
        uint8[9] memory walls;
        uint256 currentTime = user[msg.sender].currentBlockTime;
        unchecked {
            for (uint256 i = 9; i != 0; --i) {
                height = currentTime % 10;
                walls[i-1] = uint8(height);
                if (height == 0) walls[i-1] = 1;
                if (height == 9) walls[i-1] = 8;
                currentTime = currentTime / 10;
            }
            user[msg.sender].totalTanks += 1;
        }
        user[msg.sender].currentTankWalls = walls;
        user[msg.sender].currentWaterVolume = 0;
        user[msg.sender].isProcessed = 0;
    }

    function computeTotalTankWaterVolume() external {
        // check for empty tank computation
        if (user[msg.sender].totalTanks == 0) revert ZeroTanks();
        // avoid re-computing the values.
        if (user[msg.sender].isProcessed != 0) revert ProcessedAlready();
        // compute and update tank volume
        uint256 currentTankVolume = computeCurrentTankWaterVolume();
        user[msg.sender].currentWaterVolume = uint32(currentTankVolume);
        user[msg.sender].totalWaterVolume += uint32(currentTankVolume);
        user[msg.sender].isProcessed = 1;
    }

    /**
     * @dev Computes current tank volume.
     * each filled block is counted as one volume.
     */
    function computeCurrentTankWaterVolume() internal view returns(uint256 currentTankVolume) {
        uint256 left;
        uint256 right = 8;
        uint256 leftMax;
        uint256 rightMax;
        uint8[9] memory walls = user[msg.sender].currentTankWalls;
        unchecked {
            while (left < right) {
                if (walls[left] < walls[right]) {
                    if (walls[left] >= leftMax) {
                        leftMax = walls[left];
                    } else {
                        currentTankVolume += leftMax - walls[left];
                    }
                    ++left;
                }
                else {
                    if (walls[right] >= rightMax) {
                        rightMax = walls[right];
                    } else {
                        currentTankVolume += (rightMax - walls[right]);
                    }
                    --right;
                }
            }
        }
    }

    /**
     * @dev returns the current tank walls of the caller.
     */
    function myCurrentTankWalls() external view returns(uint8[9] memory currentTankWalls){
        currentTankWalls = user[msg.sender].currentTankWalls;
    }

    /**
     * @dev returns the current block time of the caller.
     */
    function myCurrentBlockTime() external view returns(uint256 currentBlockTime){
        currentBlockTime = user[msg.sender].currentBlockTime;
    }

    /**
     * @dev returns the total tanks owned by the caller.
     */
    function myTotalTanks() external view returns(uint256 totalTanks){
        totalTanks = user[msg.sender].totalTanks;
    }

    /**
     * @dev returns the current water volume of the caller.
     * @notice for realistic volume provided LxWxH is 12x1x8
     * Assuming measurements in meters, multiply the result with 96,000 litres.
     */
    function myCurrentWaterVolume() external view returns(uint256 currentWaterVolume){
        currentWaterVolume = user[msg.sender].currentWaterVolume;
    }

    /**
     * @dev returns the total water volume of the caller.
     * @notice for realistic volume provided LxWxH is 12x1x8
     * Assuming measurements in meters, multiply the result with 96,000 litres.
     */
    function myTotalWaterVolume() external view returns(uint256 totalWaterVolume){
        totalWaterVolume = user[msg.sender].totalWaterVolume;
    }

    // Avoid re-computing the volume again for the same tank.
    error ProcessedAlready();
    // Don't create new tank if current tank is unprocessed.
    error TankUnprocessed();
    // Error on computation on empty tank.
    error ZeroTanks();
}