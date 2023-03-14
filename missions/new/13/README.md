Submission 1:([arularmstrong](https://github.com/arularmstrong))<br>
[demo](https://www.youtube.com/watch?v=WCkqoAZjR5M) <br>
[website](https://bafybeifdw2h5o2exrxe2ibxgvaxqtns5rltxvx3kxyvubksfhca5x533ka.ipfs.cf-ipfs.com)

## Mission 13: Play Sudoku

<img src="images/validSudoku.png" alt="validSudoku"/>

Image credit: https://www.youtube.com/watch?v=TjFXEUCMqI8

## Overview

Solidity programming challenge for
playing and validating a valid Sudoku game.

## Requirements

Create a smart contract called: ```PlaySudoku``` which:

    -is deployed to Sphinx 1.1
    -there is a mapping: address => didThePlayerWin
    -currentBoard:
        -constant 2D array
        -9x9 Sudoku board
        -can be any Sudoku board, buy should be 2 winning moves away from winning
    -function verifyWin:
        -take the input coordinates from the player with input values 1 to 9
        -after adding these values to the board, check no values repeat for each:
            -row
            -column
            -square
        -set didThePlayerWin = true if the user has the correct input coordinate values

Create a basic frontend for ```PlaySudoku``` which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -shows: 
        -didThePlayerWin for the connected wallet
        -currentBoard as a 2D grid image
    -has button for function verifyWin

## Resources

Valid Sudoku - Amazon Interview Question - Leetcode 36 - Python 

https://www.youtube.com/watch?v=TjFXEUCMqI8