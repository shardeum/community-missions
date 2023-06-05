// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//import "hardhat/console.sol";

contract WordMixValidator {

    function strEq(string memory first, string memory second) public pure returns (bool) {
        return keccak256(abi.encodePacked(first)) == keccak256(abi.encodePacked(second));
    }

    function strLen(string memory str) public pure returns (uint256) {
        return bytes(str).length;
    }

    function getSlice(uint256 begin, uint256 end, string memory text) public pure returns (string memory) {
        bytes memory a = new bytes(end-begin);
        for(uint i=0;i<=end-1-begin;i++){
            a[i] = bytes(text)[i+begin];
        }
        return string(a);    
    }

    function validate(string memory targetString, string[] memory wordList) public view returns (bool) {
        bool[] memory dp = new bool[](strLen(targetString) + 1);
        //console.log(strLen(targetString));
        dp[strLen(targetString)] = true;
        for (uint i; i < strLen(targetString); ++i) {
            uint i2 = (strLen(targetString) - 1) - i;
            //console.log(i2);
            for (uint i3; i3 < wordList.length; i3++) {
                string memory w = wordList[i3];
                //console.log(i3);
                if ((i2 + strLen(w) <= strLen(targetString)) && (strEq(getSlice(i2, i2 + strLen(w), targetString), w))) {
                    dp[i2] = dp[i2 + strLen(w)];
                }
                if (dp[i2]) {
                    break;
                }
            }
        }
        return dp[0];
    }
}
