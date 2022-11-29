// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

error invalidCandyIdNumber();

contract Pinata is ERC1155 { //ERC1155 cannot also be a ERC1155Holder for having tokens ERC1155 tokens sent to it.

    mapping(uint256 => bool) minted;

    constructor() ERC1155("ipfs:///{name}") {}

    function hit(uint256 tokenId) public {
        if(tokenId > 2)  { revert invalidCandyIdNumber(); }
        if (minted[0] == true && minted[1] == true && minted[2] == true){
            revert("Pinata is already finished");
        }
        _mint(msg.sender, tokenId, 5, "");
        minted[tokenId] = true;
    }

}