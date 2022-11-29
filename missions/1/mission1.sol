// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Mission1 is ERC1155 {
    bool[3] public minted;
    address public owner;

    constructor() ERC1155("Qma4f8StPhUCG4csS2LyXWETMGzpzhUb6rraFAFxBFR2mo") {
        owner = msg.sender;
    }

    function hit(uint tokenId) public {
        require(minted[tokenId] == false, "This type of candy is already minted!!!");
        if (minted[0] == true && minted[1] == true && minted[2] == true){
            revert("Pinata has no more candy");
        }
        minted[tokenId] = true;
        _mint(msg.sender, tokenId, 5, "");
    }

}
