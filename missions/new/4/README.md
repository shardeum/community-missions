# Mission 4: SupraOracles Order Book DEX

<img src="images/supraOracles.jpeg" alt="supraOracles"/>

Image Credit: https://twitter.com/supraoracles/status/1518626704008249344

## Overview

Solidity programming challenge for doing swaps with a smart contract with a SupraOracles price feed oracle order book.

## Requirements

Create a smart contract called ```OrderBookDex``` which:

     -is deployed to Shardeum Liberty 2.1
     -connects to the SupraOracle pricefeed oracle contract
     -has a function called ratio which:
         -has two input strings:
            -numerator
            -denominator        
         -both input strings are used to call sValueFeed.checkPrice(string supportedPair). Example:
            -(int price,) = sValueFeed.checkPrice("btc_usdt");:
         -return the price feed ratio to do the swap
     -has a function called swap which:
         -will take the selected token from the user in exchange for USDT based on price feed oracle
         -will take USDT (if selected) from the user in exchange for the token selected based on price feed oracle
         -will handle swaps between all other token pairs using the ratio function

Create a basic frontend for ```OrderBookDex``` which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -has a list drop down with search option (with token logos) for selected:
        -from token with USD (based on USDT) ratio
        -to token with USD (based on USDT) ratio
    -has an input box for from token quantity
    -display the conversion rate for the swap
    -swap button for calling swap from OrderBookDex contract with inputs:
        -from:
             -token
             -quantity
        -to:
             -token

Note: you will need to deploy mock ERC-20 tokens for the video demo to show the swaps working!

## Resources

SupraOracle price feed network addresses:

https://supraoracles.com/docs/get-started/networks

SupraOracle price feed strings for networks (use Shardeum Liberty 2.1):

https://data.supraoracles.com/networks
https://data.supraoracles.com/networks/shardeum_2_1

SupraOracle fixed string ratio BTC/ETH Solidity smart contract:

https://github.com/Shardeum/SupraOracles/blob/main/src/PricefeedFlipMe.sol
