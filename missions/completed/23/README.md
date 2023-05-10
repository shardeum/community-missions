## Mission 23: Coin Change Optimization

<img src="images/change.png" alt="change"/>

Image credit: https://www.youtube.com/watch?v=H9bfqozjoqs

## Overview

Calculate the change needed in coins needed from a payment with a Solidity smart contract.

## Requirements

Create a smart contract called: `CoinChange` which:
        
    -is deployed to Betanet 1.X
    -changeReturn
        -takes input data:
            -amountDue
            -amountPaid        
        -changeDue = amountPaid - amountDue
        -is able to return change in coins:
            -quarters (25 cents)
            -dimes (10 cents)
            -nickles (5 cents)
            -pennies (1 cent)
        -return an array which represents the coins needed back. Example:
            -changeReturn(59,100)
            -41 = 100 - 59
            -41 = 25 + 10 + 5 + 1
            -[1 (quarter), 1 (dime), 1 (nickle), 1 (penny)]

Create a basic frontend which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -allows user to interact with all features mentioned above

## Resources

Coin Change - Dynamic Programming Bottom Up - Leetcode 322 

https://www.youtube.com/watch?v=H9bfqozjoqs
