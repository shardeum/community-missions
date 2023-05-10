// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract CoinChange {
    function changeReturn(uint256 amountDue, uint256 amountPaid) public pure returns (uint256[] memory) {
        // Calculate the change due
        uint256 changeDue = amountPaid - amountDue;
        
        // Initialize an array representing the value of each coin
        uint256[] memory coins = new uint256[](4);
        coins[0] = 25;
        coins[1] = 10;
        coins[2] = 5;
        coins[3] = 1;
        
        // Initialize an array to store the coins needed
        uint256[] memory coinsNeeded = new uint256[](4);
        
        // Iterate over the coins array
        for (uint i = 0; i < coins.length; i++) {
            // Divide the change due by the value of the coin, and round down to the nearest integer
            uint256 numCoins = changeDue / coins[i];
            
            // Subtract the value of the coins from the change due
            changeDue -= numCoins * coins[i];
            
            // Append the number of coins needed to the coinsNeeded array
            coinsNeeded[i] = numCoins;
        }
        
        // Return the coinsNeeded array
        return coinsNeeded;
    }
}
