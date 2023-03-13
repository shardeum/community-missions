## Mission 12: Image Editor
site: https://calm-fire-6303.on.fleek.co
Demo: https://youtu.be/iLcFHELzCQU
<img src="images/rotateImage.png" alt="rotateImage"/>

Image credit: https://www.youtube.com/watch?v=ykT63NoQWLI

## Overview

Solidity programming challenge for
changing a 2D image based on image rotations and flips. 

## Requirements

Create a smart contract called: ```ImageEditor``` which:

    -is deployed to Sphinx 1.1
    -there is a mapping with a struct: address => userImageData
    -struct userImageData includes:
        -rightTurns
        -leftTurns
        -verticalFlips
        -horizontalFlips 
        -currentImage
    -currentImage:
        -3x3 image stored in a 2D array
        -currentImage should increase from 
        left to right row by row to show numbers 1 to 9, such that:
            -currentImage[0][0] is 1
            -currentImage[2][2] is 9
    -function turnRight:
        -rotate the currentImage clockwise 90 degrees
        -increment rightTurns by 1 
    -function turnLeft:
        -rotate the currentImage counterclockwise 90 degrees
        -increment leftTurns by 1 
    -function flipVertically:
        -flip the currentImage vertically
        -increment verticalFlips by 1 
    -function flipHorizontally:
        -rotate the currentImage horizontally
        -increment horizontalFlips by 1 

Create a basic frontend for ```ImageEditor``` which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -shows the values for the connected wallet: 
        -rightTurns
        -leftTurns
        -verticalFlips
        -horizontalFlips 
        -currentImage
    -shows currentImage as a 2D grid image
    -has buttons for functions:
        -turnRight
        -turnLeft
        -flipHorizontally
        -horizontalFlips

## Resources

Rotate Matrix By 90 Degree || Rotate Image(Clock Wise) || Leetcode (Mirror Image) 

https://www.youtube.com/watch?v=ykT63NoQWLI
