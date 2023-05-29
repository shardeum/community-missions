## Mission 26: Word Mixer

<img src="images/wordBreak.png" alt="wordBreak"/>

Image credit: https://www.youtube.com/watch?v=Sx9NNgInc3A

## Overview

Check if you can create a string out of specific words Solidity.

## Requirements

Create a smart contract called: `WordMixValidator` which:
        
    -is deployed to Betanet 1.X
    -function: validate
        -targetString [argument 0]:
            -string we want to emulate
        -wordList [argument 1]
            -string array 
            -check the different word combinations to see if they can match the targetString

Tip: try to use calldata for string arguments if possible to save gas if you don't need to modify the input data (otherwise you need memory instead of calldata, since memory is mutable and calldata is immutable) 
    
Create a basic frontend which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -allows user to interact with all features mentioned above

## Resources

Word Break - Dynamic Programming - Leetcode 139 - Python 

https://www.youtube.com/watch?v=Sx9NNgInc3A