## Mission 22: UniswapV3 Implementation 

<img src="images/uniswapv3.png" alt="uniswapv3"/>

Image credit: https://thegraph.com/hosted-service/subgraph/messari/uniswap-v3-celo

## Overview

Fully implement UniswapV3 for adding pairs, removing pairs and doing swaps. 

## Requirements

Deploy all relevant contracts needed for UniswapV3 to:
    
    -add liquidity 
    -remove liquidity 
    -swap

Create a basic frontend which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -allows user to interact with all features mentioned above

Optional challenge:

    -deploy and integrate UniversalRouter.sol for swaps (you can use SwapRouter.sol instead)

## Resources

WSHM addresses on different Shardeum networks

https://docs.shardeum.org/smartContracts/tokens/addressList

Deploying Uniswap V3: A developers guide to Navigating the Complexities

https://bobanetwork.medium.com/deploying-uniswap-v3-a-developers-guide-to-navigating-the-complexities-269dde21bff6

Locally Deploy & Add Liquidity to Uniswap V3 Pools | Ultimate Setup for Local Uniswap Testing | DeFi

https://www.youtube.com/watch?v=SeiaiiviEhM

UniswapV3Factory.sol

https://etherscan.io/address/0x1f98431c8ad98523631ae4a59f267346ea31f984#code

NonfungiblePositionManager.sol

https://etherscan.io/address/0xc36442b4a4522e871399cd717abdd847ab11fe88#code

SwapRouter.sol

https://etherscan.io/address/0xe592427a0aece92de3edee1f18e0157c05861564#code

Optional challenge:

UniversalRouter.sol

https://etherscan.io/address/0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b#code

UniversalRouter Commands Documentation

https://docs.uniswap.org/contracts/universal-router/technical-reference#command