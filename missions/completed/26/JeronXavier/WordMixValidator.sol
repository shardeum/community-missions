// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract WordMixValidator {
    function validate(string calldata targetString, string[] calldata wordList) external pure returns (bool) {
        uint256 length = bytes(targetString).length;

        uint256[] memory result = new uint256[](length + 1);
        result[0] = 1;
        
        for (uint256 i = 1; i <= length; ++i) {
            for (uint256 j; j != wordList.length; ++j) {
                uint256 wordLength = bytes(wordList[j]).length;
                if (i >= wordLength) {
                    if (isEqual(substring(targetString, i - wordLength, i), wordList[j])) {
                        result[i] += result[i - wordLength];
                    }
                }
            }
        }

        return result[length] > 0;
    }
    
    function substring(string calldata _string, uint256 _start, uint256 _end) private pure returns (string memory) {
        bytes calldata strBytes = bytes(_string);
        bytes memory result = new bytes(_end - _start);
        for (uint256 i = _start; i != _end; ++i) {
            result[i - _start] = strBytes[i];
        }
        return string(result);
    }

    function isEqual(string memory _string1, string memory _string2) private pure returns (bool) {
        return (keccak256(abi.encodePacked(_string1)) == keccak256(abi.encodePacked(_string2)));
    }
}