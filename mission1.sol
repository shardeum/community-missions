// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";


contract CandyStore is ERC1155 { //ERC1155 cannot also be a ERC1155Holder for having tokens ERC1155 tokens sent to it.

    uint public tokenId; 

    constructor() ERC1155("ipfs://QmXv2dCYNkyHgFN5hSk3VmRwSP5zwTEP6WD9Mrffd2Azyz/{id}") { tokenId=0;}

    function hit() public 
    {
        if(tokenId > 2) {revert ("no more candies in the Pinata");} // pinata is empty after 3 types
        _mint(msg.sender, tokenId,10**5,""); // mint 5 candies of this type
        tokenId = tokenId+1; // next type
    }

}

contract BurnTokensERC1155 is ERC1155Holder {} //Tokens sent to this contract will be lost forever.
