Submission 1:([w1729](https://github.com/w1729))<br>
[demo](https://youtu.be/oxWDawtdwSs) <br>
[website](https://wild-union-5347.on.fleek.co/)

Submission 2:([arularmstrong](https://github.com/arularmstrong))<br>
[demo](https://www.youtube.com/watch?v=MtNXyrr3niU) <br>
[website](https://bafybeifk2kof635anhtmcfhyjbgeokje7mhxzw37lphplb6syqkt7oqgiu.ipfs.cf-ipfs.com)

Submission 3:([cryptoonex](https://github.com/cryptoonex))  
<a href="https://withered-math-3443.on.fleek.co">Website</a>  
<a href="https://youtu.be/x-MJVQecqAI"> Video</a>  

## Mission 11: Water Tank Volume

<img src="images/trapRainWater.png" alt="trapRainWater"/>

Image credit: https://www.youtube.com/watch?v=_baekNtklZ8

## Overview

Solidity programming challenge for
creating random wall heights that hold water based on time, then computing the total water volume held by the random walls.

## Requirements

Create a smart contract called: ```TotalVolumeTanks``` which:

    -is deployed to Shardeum Liberty 2.1
    -there is a mapping with a struct: address => userWaterTankData
    -struct userWaterTankData includes:
        -currentBlockTime
        -currentTankWalls
        -totalTanks
        -currentWaterVolume
        -totalWaterVolume
    -currentTankWalls:
        -the tank has the following dimensions:
            -length: 12 (x-axis)
            -width:  1  (z-axis)
            -height: 8  (y-axis)
        -to keep things simple, assume we have an 8x12 grid
        -array for each wall height:
            -convert y = 0 to y = 1 
            -convert y = 9 to y = 8
            -currentTankWalls[9] = 1
            -currentTankWalls[10] = 1 
            -currentTankWalls[11] = 8
    -function createNewMap:
        -updates currentTankWalls from block.timestamp (uint) that is saved into currentBlockTime with logic:
            -decimal places represent wall height:
            -time to wall array logic step by step:
                -decimal value for unix time example: 1673409443
                -ignore the first decimal place: 673409443
                -convert each decimal place to wall height array from left to right: [6,7,3,4,0,9,4,4,3]
                -convert all 0 values to 1 and all 9 values to 8: [6,7,3,4,1,8,4,4,3]
        -increase totalTanks by 1
    -function currentTankTotalWaterVolume:
        -compute the current total volume
        -increase the totalWaterVolume by currentWaterVolume

Create a basic frontend for ```TotalVolumeTanks``` which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -shows the values for the connected wallet: 
        -currentBlockTime
        -currentTankWalls
        -totalTanks
        -currentWaterVolume
        -totalWaterVolume
    -shows currentTankWalls as a 2D grid (length and height shown, width comes in and out of the page) with:
        -the walls with no water when new tank walls created
    -has buttons for:
        -for creating new tank walls based on time
        -for calculating the total volume with the current walls

## Resources

Coding Interview Question | Volume of Histogram | Rain Water trap | Data Structures and Algorithms

https://www.youtube.com/watch?v=_baekNtklZ8
