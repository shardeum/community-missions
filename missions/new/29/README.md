## Mission 29: Huff Vault

<img src="images/huffVault.png" alt="huffVault"/>

Image credit: https://twitter.com/aztecnetwork/status/1552406933855825920

## Overview

Create a bank contract in Huff which locks your tokens and mints ERC-20 tokens over time.

## Requirements

Create a smart contract called: `TimeVaultLock` which:
        
    -is deployed to Betanet 1.X
    -follows the ERC-20 token standard
    -mapping(address => uint256) public depositTime;
    -function: deposit
        -msg.value [add the payable function modifier to accept msg.value]:
            -must deposit exactly 1 wei when this transaction is called
        -depositTime[msg.sender] must be 0 (meaning you didn't deposit already from that same wallet address)
        -set depositTime[msg.sender] to the current unix time with block.timestamp
    -function: withdraw
        -depositTime[msg.sender] must not be 0 (meaning the user deposited at some point)
        -mint tokens to msg.sender based on lockedTime
            -lockedTime = block.timestamp - depositTime[msg.sender]
                -Example: lockedTime = block.timestamp - depositTime[msg.sender] = 1685973567 - 1685973507 = 60 seconds = 60 wei tokens to mint for msg.sender
            -Note: ERC-20 tokens have no fallback or receive functions, so there is no risk for reentrancy attacks minting tokens at any point
        -set depositTime[msg.sender] to 0 which confirms the withdraw went through (make sure this done before the msg.value transfer or else a reentrancy attack can occur)
        -transfer out msg.value back to msg.sender
            -call 
                -address = msg.sender  
                -msg.value = 1 wei 
                -check if call was successful (dynamic gas to avoid getting stuck like transfer or send)
            -do this at the very end to prevent reentrancy attacks from fallback and receive functions

Tip: use custom revert error messages with if statements instead of require to save gas
           
Create a basic frontend which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -allows user to interact with all features mentioned above

## Resources

Huff EVM Programming Language 

https://github.com/huff-language/huff-rs

ERC-20 Huff Contract

https://github.com/huff-language/huffmate/blob/main/src/tokens/ERC20.huff