// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract TimeVaultLock is ERC20{
    mapping(address => uint256) public depositTime;
    error MoneyNotWithdrawn(string msg);
    error DepositTimeNotBeZero(uint time,string msg);
    error MoneyShouldBeFixed(uint amount);
    receive() payable external {}
    address public owner;
    constructor() ERC20("Shardeum", "SHM") {
        owner= msg.sender;
    }
    function deposit() payable public {
        if(depositTime[msg.sender]!=0){
            revert DepositTimeNotBeZero({
                time:depositTime[msg.sender],
                msg:"Deposit time should be zero"
            });
        }
        if(msg.value!=1 wei){
            revert MoneyShouldBeFixed({
                amount:msg.value
            });
        }
        depositTime[msg.sender]=block.timestamp;
    }
    function withdraw() payable public {
         if(depositTime[msg.sender]!=0){
            revert DepositTimeNotBeZero({
                time:depositTime[msg.sender],
                msg:"Deposit time should be zero"
            });
        }
        uint lockedTime = block.timestamp - depositTime[msg.sender];
        _mint(msg.sender, lockedTime);
        (bool sent,) = (msg.sender).call{value: 1 wei}("");
        if(!sent){
            revert MoneyNotWithdrawn({
                msg:"Money not withdraw"
            });
        }
      
        depositTime[msg.sender]=0;
    }
}