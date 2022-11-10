# Mission 1: Pinata Storing Candy

## Overview

You are at a party, and you are hitting a Pinata with a stick.
Each time you hit the Pinata, a new type of candy pops out.
Let's say that the Pinata shows all candy after 3 hits.
On every hit, the Pinata will give the same candy type in exactly 5 pieces. 

## Requirements

Using an ERC-1155 contract, create a function called that can:

      -mint 3 different candy types (hint: based on tokenId)
      -mint 5 pieces of each candy type
      -require / revert hitting the Pinata after 3 unique pieces of candy have been minted (since Pinata has no more candy)
      -each candy type has a photo of what the candy looks like, by using Pinata storage and IPFS CID hashes

## Resources

ERC-1155 Document:

https://docs.shardeum.org/smartContracts/tokens/ERC-1155

Pinata file storage:

https://app.pinata.cloud/pinmanager
