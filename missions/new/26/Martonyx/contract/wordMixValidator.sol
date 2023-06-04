// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WordMixValidator {

    function canFormTargetWordCaseSensitive(string memory targetWord, string[] memory wordList) public pure returns (bool) {
        uint256 count = 0;

        for (uint256 i = 0; i < wordList.length; i++) {
            string memory singleWord = wordList[i];
            if (bytesEqualCaseSensitive(bytes(singleWord), bytes(targetWord))) {
                count++;
            }

            for (uint256 j = i + 1; j < wordList.length; j++) {
                string memory combinedWord = string(abi.encodePacked(wordList[i], wordList[j]));
                if (bytesEqualCaseSensitive(bytes(combinedWord), bytes(targetWord))) {
                    count++;
                }
            }
        }

        return count > 0;
    }

    function canFormTargetWordIgnoreCase(string memory targetWord, string[] memory wordList) public pure returns (bool) {
        uint256 count = 0;

        for (uint256 i = 0; i < wordList.length; i++) {
            string memory singleWord = wordList[i];
            if (stringsEqualIgnoreCase(singleWord, targetWord)) {
                count++;
            }

            for (uint256 j = i + 1; j < wordList.length; j++) {
                string memory combinedWord = string(abi.encodePacked(wordList[i], wordList[j]));
                if (stringsEqualIgnoreCase(combinedWord, targetWord)) {
                    count++;
                }
            }
        }

        return count > 0;
    }

    function bytesEqualCaseSensitive(bytes memory a, bytes memory b) internal pure returns (bool) {
        if (a.length != b.length) {
            return false;
        }

        for (uint256 i = 0; i < a.length; i++) {
            if (a[i] != b[i]) {
                return false;
            }
        }

        return true;
    }

    function stringsEqualIgnoreCase(string memory a, string memory b) internal pure returns (bool) {
        bytes memory aa = bytes(a);
        bytes memory bb = bytes(b);
        if (aa.length != bb.length) {
            return false;
        }

        for (uint256 i = 0; i < aa.length; i++) {
            bytes1 charA = aa[i];
            bytes1 charB = bb[i];
            if (_toLower(charA) != _toLower(charB)) {
                return false;
            }
        }

        return true;
    }

    function _toLower(bytes1 b) internal pure returns (bytes1) {
        if (uint8(b) >= 65 && uint8(b) <= 90) {
            return bytes1(uint8(b) + 32);
        }
        return b;
    }
}