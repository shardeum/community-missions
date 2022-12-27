//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.12;

interface ISupraOracle {

    function checkPrice(string memory marketPair) external view returns (int256 price, uint256 timestamp);

}