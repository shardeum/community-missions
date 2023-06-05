//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract WordMixValidator {
	function hasWord(string[] memory words, string memory result) private pure returns (bool) {
        for (uint256 i = 0; i < words.length; i++) {
            if (keccak256(abi.encodePacked(words[i])) == keccak256(abi.encodePacked(result))) {
                return true;
            }
        }
        return false;
    }

    function validate(string memory targetString, string[] memory wordList) external pure returns (bool) {
        uint256 len = bytes(targetString).length;
        bool[] memory flags = new bool[](len + 1);
        flags[0] = true;

        for (uint256 i = 1; i <= len; i++) {
            for (uint256 j = 0; j < i; j++) {
                if (flags[j] && hasWord(wordList, substring(targetString, j, i))) {
                    flags[i] = true;
                    break;
                }
            }
        }

        return flags[len];
    }

    function substring(string memory str, uint256 start, uint256 end) private pure returns (string memory) {
        bytes memory substr = bytes(str);
        bytes memory result = new bytes(end - start);
        for (uint256 i = start; i < end; i++) {
            result[i - start] = substr[i];
        }
        return string(result);
    }
}
