// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

error invalidCandyIdNumber();

contract Pinata is ERC1155 {

    mapping(uint256 => bool) public minted;

    constructor() ERC1155("ipfs://QmQt7PrFkinoSRRDDauTpDXVroA2jnjcA1HfXD24QA77X8/{id}") {}

    function hit(uint256 tokenId) public {
        if(tokenId > 2)  { revert invalidCandyIdNumber(); }
        if(minted[tokenId] == true) { revert("Candy already taken");}
        if (minted[0] == true || minted[1] == true || minted[2] == true){
            revert("Pinata has no more candies");
        }
        _mint(msg.sender, tokenId, 5, "");
        minted[tokenId] = true;
    }

}