# Mission 1: Pinata Storing Candy

<img src="https://gateway.pinata.cloud/ipfs/QmdrnCFg5vxJbw4VCaNyEWSsJBMy9JS4CgaEk3NRc6nb2V" alt="shardeumPinata"/>

## Overview

You are at a party, and you are hitting a Pinata with a stick.
Each time you hit the Pinata, a new type of candy pops out.
Let's say that the Pinata shows all candy after 3 hits.
On every hit, the Pinata will give the same candy type in exactly 5 pieces. 

## Requirements

Using an ERC-1155 contract deployed on Shardeum Liberty 2.0, create a function called ```hit``` that can:

      -mint 3 different candy types (hint: based on tokenId)
      -mint 5 pieces of each candy type
      -require / revert hitting the Pinata after 3 unique pieces of candy have been minted (since Pinata has no more candy)
      -each candy type has a photo of what the candy looks like, by using Pinata storage and IPFS CID hashes
      -do not include the gateway url info, just the CID on IPFS

## Resources

ERC-1155 Document:

https://docs.shardeum.org/smartContracts/tokens/ERC-1155

Pinata file storage:

https://app.pinata.cloud/pinmanager


## Deployed contract on Liberty2.0 - 0xF914b00206E10a3f04774798B5B4E15f39196A29

## Demo video -https://www.loom.com/share/29f5db2cf13c438a9ecd66928bd526bb