## Mission 14: Automated Sudoku

<img src="images/puzzleToSolve.png" alt="puzzleToSolve"/>

Image credit: https://www.activestate.com/blog/solving-sudoku-with-python-and-artificial-intelligence/

## Overview

Solidity programming challenge for
automatically solving and validating a valid Sudoku game.

## Requirements

Create a smart contract called: ```PlaySudoku``` which:

    -is deployed to Sphinx 1.1
    -there is a mapping: address => didThePlayerWin
    -currentBoard:
        -constant 2D array
        -9x9 Sudoku board
        -should be the Sudoku board pictured at the top of this mission 
    -function computeBruteForceWin:
        -use a brute force strategy to calculate the Sudoku board solution
        -save coordinates after you use function verifyWinBruteForce
    -function verifyWinBruteForce:
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
    -has button for function computeBruteForceWin

## Resources

How to build an AI algorithm that solves Sudoku puzzles 

https://www.activestate.com/blog/solving-sudoku-with-python-and-artificial-intelligence/