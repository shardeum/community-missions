## Mission 15: Escape The Room

# Submission

Discord handle: Thunderbolt#1106

# Website
https://cold-cherry-5093.on.fleek.co/

# Video
https://youtu.be/OQGcY3cjV3c

<img src="images/botPaths.png" alt="botPaths"/>

Image credit: https://www.youtube.com/watch?v=d3UOz7zdE4I

## Overview

Solidity programming challenge for finding paths to escape the room. 

## Requirements

Create a smart contract called: ```EscapeTheRoom``` which:

    -is deployed to Sphinx 1.1
    -there is a mapping with a struct: address => escapeRoomData
    -struct userWaterTankData includes:
        -currentRoomCoordinates
        -currentPaths
    -currentRoom:
        -constant 2D array
        -3x3 grid
        -currentRoom[0][0] is the starting coordinate 
        -currentRoom[2][2] is the escape coordinate  
        -obstacle coordinate:
            -is represented by currentRoom[row][column] = 1
            -row and column are determined randomly by equation: 
                -(block.timestamp % 7) + 2 
                -equation to row and column coordinates examples when:
                    -(block.timestamp % 7) + 2 = 2: currentRoom[0][1] = 1
                    -(block.timestamp % 7) + 2 = 3: currentRoom[0][2] = 1
                    -(block.timestamp % 7) + 2 = 4: currentRoom[1][0] = 1
    -function generateNewBoard:
        -creates a new board based on obstacle coordinate logic
    -function computePathsCurrentBoard:
        -compute paths for current board and store in currentPaths

Create a basic frontend for ```EscapeTheRoom``` which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -shows: 
        -currentBoard as a 2D grid image
    -has button for functions:
        -generateNewBoard
        -computePathsCurrentBoard

## Resources

Unique Paths II - Leetcode 63 - Python 

https://www.youtube.com/watch?v=d3UOz7zdE4I
