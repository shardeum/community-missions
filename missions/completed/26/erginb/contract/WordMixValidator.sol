// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract WordMixValidator {
    function validate(string calldata targetString, string[] calldata wordList) external pure returns (bool) {
        bytes memory targetBytes = bytes(targetString);
        uint256 targetLength = targetBytes.length;
        uint256 wordCount = wordList.length;

        for (uint256 i = 0; i < (1 << wordCount); i++) {
            bytes memory combined = new bytes(targetLength);
            uint256 combinedIndex = 0;

            for (uint256 j = 0; j < wordCount; j++) {
                if (((i >> j) & 1) == 1) {
                    bytes memory wordBytes = bytes(wordList[j]);
                    for (uint256 k = 0; k < wordBytes.length; k++) {
                        if (combinedIndex < targetLength) {
                            combined[combinedIndex++] = wordBytes[k];
                        } else {
                            break;
                        }
                    }
                }
            }

            if (combinedIndex == targetLength && keccak256(combined) == keccak256(targetBytes)) {
                return true;
            }
        }

        return false;
    }
}