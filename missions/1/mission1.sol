// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Mission1 is ERC1155 { //
    uint public constant CandyA = 0;
    uint public constant CandyB = 1; 
    uint public constant CandyC = 2;
    bool[3] minted;
    address owner;

    constructor() ERC1155("https://gateway.pinata.cloud/ipfs/QmaUkyAEb7GrGVECTGibdPxgTHYUTCG535v2eC3dSaDjDZ/{tokenId}.png") {
        owner = msg.sender;
    }

    function hit(uint tokenId) public {
        require(minted[tokenId] == false, "This type of candy is already minted!!!");
        minted[tokenId] = true;
        _mint(msg.sender, tokenId, 5, "");
    }

}
