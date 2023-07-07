// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Upgrade.sol";

contract UpgradableContract is ERC1967Upgrade {
	uint256 public importantVariable;

	function changeImportantVariable(uint256 newValue) external {
		importantVariable = newValue;
	}

	function upgradeContract(address newImplementation) external {
		require(msg.sender == _getAdmin(), "Not deployer");
		_upgradeTo(newImplementation);
	}
}