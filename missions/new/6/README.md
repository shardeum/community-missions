# Mission 6: Shardeum Timeshare Islands

<img src="images/islandCount.png" alt="islandCount"/>

Image Credit: https://www.youtube.com/watch?v=viJEZSX4cDg

## Overview

Solidity programming challenge for generating islands on a grid based on time, then counting these islands using recursion.

## Requirements

Create a smart contract called ```ShardeumTimeshareIslands``` which:

     -is deployed to Shardeum Liberty 2.1
     -there is a mapping with a struct: address => userMapIslandData
     -struct userMapIslandData includes:
          -currentTimeMap
          -totalMaps
          -totalIslands
    -currentTimeMap:
        -represents a 3x5 grid
        -is converted from block.timestamp (uint) to a 2D uint array:
            -[0][0] represents bit 0
            -[0][4] represents bit 4
            -[1][0] represents bit 5
            -[2][4] represents bit 14
    -function createNewMap:
        -will create a new currentTimeMap state based on the current block.timestamp value
            -hint: bit masking and using the modulus will make this simpler
    -function countIslands:
        -will perform recursion to count islands on the currentTimeMap
            -tiles are considered connected as a connected single island if they are 1 tile:
                -up
                -down
                -left
                -right
            -tiles diagonal from each other are not considered connected
            -hint: try using a basic case (dfs [depth first search] might be useful as well)
        -will increase the totalIslands count by the currentTimeMap recursion counter
        -will increase the totalMaps count by 1
        -will call createNewMap to set a new map
        

Create a basic frontend for ```ShardeumTimeshareIslands``` which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -displays the userMapIslandData
        -hint: make sure you have currentTimeMap as a 3x5 grid to help visualized the islands
    -button for functions:
        -createNewMap
        -countIslands

## Resources

Number of Islands Leetcode 200 | Recursion | Depth First Search | Amazon Interview Question:

https://www.youtube.com/watch?v=viJEZSX4cDg