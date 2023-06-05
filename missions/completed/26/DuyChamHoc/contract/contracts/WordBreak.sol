// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WordBreak {
    function verify(
        string memory s,
        string[] memory wordDict
    ) public pure returns (bool) {
        bool[] memory dp = new bool[](bytes(s).length + 1);
        dp[bytes(s).length] = true;

        for (int256 i = int256(bytes(s).length) - 1; i >= 0; i--) {
            for (uint256 j = 0; j < wordDict.length; j++) {
                string memory w = wordDict[j];
                if (
                    i + int256(bytes(w).length) <= int256(bytes(s).length) &&
                    compareStrings(s, i, bytes(w))
                ) {
                    dp[uint256(i)] = dp[uint256(i) + bytes(w).length];
                }
                if (dp[uint256(i)]) {
                    break;
                }
            }
        }
        return dp[0];
    }

    function compareStrings(
        string memory s,
        int256 start,
        bytes memory w
    ) internal pure returns (bool) {
        bytes memory sBytes = bytes(s);
        if (sBytes.length < uint256(start) + w.length) {
            return false;
        }
        for (uint256 i = 0; i < w.length; i++) {
            if (sBytes[uint256(start) + i] != w[i]) {
                return false;
            }
        }
        return true;
    }
}
