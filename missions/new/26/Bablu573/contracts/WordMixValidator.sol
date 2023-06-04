// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WordMixValidator {
    function validate(string memory s, string[] memory wordDict) public pure returns (bool) {
        uint256 n = bytes(s).length;
        bool[] memory dp = new bool[](n + 1);
        dp[0] = true; // Empty string is always breakable

        for (uint256 i = 1; i <= n; i++) {
            for (uint256 j = 0; j < i; j++) {
                if (dp[j] && isInWordDict(s, wordDict, j, i)) {
                    dp[i] = true;
                    break;
                }
            }
        }

        return dp[n]; // Return the result for the entire string
    }

    function isInWordDict(string memory s, string[] memory wordDict, uint256 start, uint256 end) private pure returns (bool) {
        string memory substring = substring(s, start, end);
        for (uint256 i = 0; i < wordDict.length; i++) {
            if (keccak256(bytes(wordDict[i])) == keccak256(bytes(substring))) {
                return true;
            }
        }
        return false;
    }

    function substring(string memory s, uint256 start, uint256 end) private pure returns (string memory) {
        bytes memory sBytes = bytes(s);
        bytes memory result = new bytes(end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = sBytes[i];
        }
        return string(result);
    }
}
