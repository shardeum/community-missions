Live demo: https://weathered-cell-1216.on.fleek.co/
video: https://youtu.be/3U2RsQvmx0E
## Mission 19: Zero Knowledge Proof ZoKrates

<img src="images/zokrates.png" alt="zokrates"/>

Image credit: https://www.youtube.com/watch?v=NMa479P8r0Y

## Overview

Create a zero knowledge proof contract with ZoKrates with Shardeum.

## Requirements

Create a smart contract called: ```ZeroKnowledgeProofZoKrates``` which:

    -is deployed to Sphinx 1.1
    -is generated from a ZoKrates circuit
    -ZoKrates circuit logic should have:
        -public 
            -input(s)
            -output(s)
        -private 
            -inputs(s)

Create a basic frontend for ```ZeroKnowledgeProofZoKrates``` which:

    -is hosted on IPFS/Filecoin using Fleek for easy access
    -allows user to connect Metamask wallet with a button
    -has a simple interface for:
        -inputs 
        -proof verification

## Resources

Computing a Hash using ZoKrates

https://zokrates.github.io/examples/sha256example.html#computing-a-hash-using-zokrates

Proof of x from H(x) using zkSnarks for Solidity Smart Contracts 

https://www.youtube.com/watch?v=NMa479P8r0Y

Example ZoKrates Verifier contract deployed to Sepolia testnet:

proof (with letters removed and added brackets to wrap the whole proof):
```solidity
[["0x2ccd01243e80e97833c828ff7a191bf7d6e585232fb36660ee7af93de30a5e7b","0x103e5f1bad0d2277614707584a159c812f3efdcbf0cb686f406394d32cd2415d"],[["0x2618a2fdc065ca794df97f8c529d2d17649066a6d1c2d7df2f7abee728870801","0x1d32b0f634c5bffd04bd9fa702a6bcbf1c62825c573acbcbb76dca7343903b42"],["0x07fbaa831dda929d475e9a75319cef62a0628dda873d048ac7a53a29db9a8faa","0x23fd8bd80e2885f12aadcdfeb1ebc162bfdc4c0f765f5931ea324355070e0a63"]],["0x016142c26845f701ce57d4daae407d16fcf6112539af81cd64582e181e91c785","0x2ca8bb75214ef3b64e58c9e137e8b052bf2dcdec48104635fc32793979533d45"]]
```
input:
```solidity
["0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000002","0x0000000000000000000000000000000004d8ac91b0ff52c3c2421267ee6da7da","0x000000000000000000000000000000006df16755c25f7be7dd284bf4ea2ecf84"]
```

https://sepolia.etherscan.io/address/0x74df70658b6b3dd026e496573469070dc19eabf4#code
