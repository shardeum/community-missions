// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console2.sol";
import "../src/UpgradableContract.sol";
import "../src/TestUpgrade.sol";
import "openzeppelin-contracts/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "openzeppelin-contracts/contracts/proxy/transparent/ProxyAdmin.sol";

contract UpgradeTest is Test {
    address public upgrade;
    address public upgrade2;
    address public proxy;
    ProxyAdmin public admin;

    function setUp() public {
        upgrade = address(new UpgradableContract());
        upgrade2 = address(new TestUpgrade());
        admin = new ProxyAdmin();
        proxy = address(new TransparentUpgradeableProxy(upgrade, address(admin), ""));
    }

    function testUserTxn() public {
        (bool s, ) = proxy.call(abi.encodeWithSignature("changeImportantVariable(uint256)", 123));
        require(s);
        ( , bytes memory data) = proxy.call(abi.encodeWithSignature("importantVariable()"));
        assertEq(data, abi.encode(123));
    }

    function testUpgrade() public {
        admin.upgrade(ITransparentUpgradeableProxy(proxy), upgrade2);

        (bool s, ) = proxy.call(abi.encodeWithSignature("changeUpgradeVariable(uint256)", 321));
        require(s);
        ( , bytes memory data) = proxy.call(abi.encodeWithSignature("upgradeVariable()"));

        vm.prank(address(vm.addr(1)));
        (s, ) = proxy.call(abi.encodeWithSignature("changeImportantVariable(uint256)", 123));
        require(s);

        ( , bytes memory data2) = proxy.call(abi.encodeWithSignature("importantVariable()"));
        console2.logBytes(data2);

        assertEq(data, abi.encode(321));
    }

    function testUnauthorizedUpgrade() public {
        admin.upgrade(ITransparentUpgradeableProxy(proxy), upgrade2);
        (bool s, ) = proxy.call(abi.encodeWithSignature("upgradeContract(address)", upgrade2));
        assertFalse(s);
    }
}
