// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TimeVaultLock is ERC20 {
    mapping(address => uint256) public depositTime;

    constructor() ERC20("TimeVaultLock", "TVL") {}

    function deposit() external payable {
        require(msg.value == 1 wei, "Please deposit exactly 1 wei.");
        require(depositTime[msg.sender] == 0, "You have already made a deposit.");

        depositTime[msg.sender] = block.timestamp;
    }

    function withdraw() external {
        require(depositTime[msg.sender] != 0, "You have not made a deposit.");

        uint256 lockedTime = block.timestamp - depositTime[msg.sender];
        uint256 tokensToMint = lockedTime;

        depositTime[msg.sender] = 0;
        _mint(msg.sender, tokensToMint);

        (bool success, ) = msg.sender.call{value: 1 wei}("");
        require(success, "Transfer failed.");
    }
}