## Mission 7: NFT Pixel Art

<img src="images/largeArtColor.png" alt="largeArtColor"/>

## Overview

Solidity programming challenge for drawing and minting on chain pixel art NFTs.

## Requirements

Create smart contracts called: ```PixelArtNoColorNFT```,```PixelArtGrayscaleNFT``` and ```PixelArtColorNFT``` which:

     -are deployed to Shardeum Liberty 2.1
     -are ERC-721 tokens that:
        -have a mint function open to everyone 
        -increases tokenId by 1 after each new mint
        -stores art metadata fully on chain

Create a basic frontend for ```PixelArtNoColorNFT```,```PixelArtGrayscaleNFT``` and ```PixelArtColorNFT``` which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -displays a pixel art canvas that allows user to select color types:
        -no color:
            -brush paints only white, since 0 represents black
            -biggest canvas
        -grayscale:
            -should have a white to gray to black brightness palette with 0 to 255 resolution: 
                -0: black
                -128: gray
                -255: white
            -medium canvas
        -color  
            -should have a full RGB color palette      
            -smallest canvas
    -the pixel art canvas can be painted with the selected color type from the canvas by moving and clicking a mouse on it
    -there is a Mint button, which mints an NFT with the canvas art data based on the corresponding color type NFT contract

## Resources

How to Make NFTs with On-Chain Metadata - Hardhat and JavaScript - Alchemy:

https://docs.alchemy.com/docs/how-to-make-nfts-with-on-chain-metadata-hardhat-and-javascript

## Submission 1

Website: https://royal-hall-8221.on.fleek.co/
Youtube Demo: https://youtu.be/Vp29lbvoMHI

## Submission 2