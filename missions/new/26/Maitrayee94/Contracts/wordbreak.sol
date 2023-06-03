// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WordMixValidator {
    function wordBreak(string memory s, string[] memory wordList) external pure returns (bool) {
        bool[] memory dp = new bool[](bytes(s).length + 1);
        dp[bytes(s).length] = true;

        for (int256 i = int256(bytes(s).length) - 1; i >= 0; i--) {
            for (uint256 j = 0; j < wordList.length; j++) {
                string memory w = wordList[j];
                uint256 wordLength = bytes(w).length;
                if (uint256(i) + wordLength <= bytes(s).length && compareStrings(substring(s, uint256(i), uint256(i) + wordLength), w)) {
                    dp[uint256(i)] = dp[uint256(i) + wordLength];
                }
                if (dp[uint256(i)]) {
                    break;
                }
            }
        }

        return dp[0];
    }

    function substring(string memory str, uint256 start, uint256 end) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(end - start);
        
        uint256 resultIndex = 0;
        for (uint256 i = start; i < end; i++) {
            result[resultIndex++] = strBytes[i];
        }
        
        return string(result);
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b)));
    }
}
