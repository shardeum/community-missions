pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BALToken is ERC20 {
    uint256 initialSupply;

    constructor(uint256 _initialSupply) public ERC20("BAL Token", "BAL") {
        _mint(msg.sender, _initialSupply);
        initialSupply = _initialSupply;
    }

    function transferToken(address recipient, uint256 amount) public {
        transfer(recipient, amount);
    }

    function getBalance(address wallet) public view returns (uint256) {
        return balanceOf(wallet);
    }
}
