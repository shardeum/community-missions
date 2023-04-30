## Mission 21: UniswapV2 Implementation 

<img src="images/uniswapv2.png" alt="uniswapv2"/>

Image credit: https://cryptomode.com/apple-app-store-holds-up-uniswaps-mobile-wallet-release-for-no-apparent-reason/

## Overview

Fully implement UniswapV2 for adding pairs, removing pairs and doing swaps. 

## Requirements

Note 1: UniswapV2Router02 depends on UniswapV2Factory, so you will need to deploy UniswapV2Factory factory first. 

Create a smart contract called ```UniswapV2Router02``` which:

    -is deployed to Sphinx 1.1
    -ETH and ERC-20 token pair (SHM and ERC-20 token on Shardeum):
        -addLiquidityETH 
            -payable to send msg.value
            -need to have ERC-2O token approval to UniswapV2Router02
        -removeLiquidityETH 
            -need to have UniswapV2 ERC-20 liquidity tokens approval to UniswapV2Router02
        -swapExactETHForTokens 
            -compute swap amount with getGetAmountsOut(amountIn,swapPath)            
            -payable to send msg.value 
        -swapExactTokensForETH 
            -compute swap amount with getGetAmountsOut(amountIn,swapPath)
            -need to have ERC-2O token approval to UniswapV2Router02
    -ERC-20 token pair:
        -addLiquidity
            -need to have both ERC-2O token approvals for UniswapV2Router02
        -removeLiquidity
            -need to have UniswapV2 ERC-20 liquidity tokens approval to UniswapV2Router02
        -swapExactTokensForTokens
            -compute swap amount with getGetAmountsOut(amountIn,swapPath)            
            -need to speicify swap path between both tokens                           
            -need to have ERC-2O token approval to UniswapV2Router02
            
Create a basic frontend for ```UniswapV2Router02``` which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -allows user to interact with all functions mentioned above

Note 2: you can also create new token pairs with UniswapV2Factory
and intgrate that into your frontend for creating pools manually (automated when adding liquidity though)

## Resources

WSHM addresses on different Shardeum networks

https://docs.shardeum.org/smartContracts/tokens/addressList

UniswapV2Factory.sol

https://etherscan.io/address/0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f#code

UniswapV2Router02.sol

https://etherscan.io/address/0x7a250d5630b4cf539739df2c5dacb4c659f2488d#code

UniswapV2Router02 Function Documentation:

https://docs.uniswap.org/contracts/v2/reference/smart-contracts/router-02
