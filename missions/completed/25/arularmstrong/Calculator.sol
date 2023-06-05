// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract Calculator {
    
    using StringUtils for bytes;
    using StringUtils for bytes1;

    /**
     * @dev Calculates the result of the given expression.
     * @param _expression The expression to evaluate.
     * @return result The result of the evaluation as an int256.
     */
    function computeStringExpression(string memory _expression) external pure returns (int256 result) {
        bytes memory expressionBytes = bytes(_expression);
        (, result) = evaluateSubExpression(expressionBytes, 0);
    }

    /**
     * @dev Recursively evaluates a sub-expression within the main expression.
     * @param _expression The expression to evaluate.
     * @param _startIndex The starting index of the sub-expression within the main expression.
     * @return expIndex The index of the main expression after the sub-expression ends.
     * @return result The result of the evaluation as an int256.
     */
    function evaluateSubExpression(bytes memory _expression, uint256 _startIndex) internal pure returns (uint256 expIndex, int256 result) {
        int256 subResult;
        int256 tempResult;
        bytes1 operation = 0x2b; // Initialize with addition operator
        uint256 expressionLength = _expression.stringLength();

        for (expIndex = _startIndex; expIndex < expressionLength; ++expIndex) {
            bytes1 char = _expression.charAt(expIndex);

            if (char.isDigit()) {
                tempResult = tempResult * 10 + int256(uint256(uint8(char))) - 0x30; // Convert character to integer value
            } else if (char.isStringEqual(0x28)) { // '(' character
                (expIndex, tempResult) = evaluateSubExpression(_expression, expIndex + 1); // Evaluate the nested sub-expression
            } else if (char.isStringEqual(0x29)) { // ')' character
                break;
            } else if (!char.isStringEqual(0x20)) { // Ignore whitespace
                subResult = performOperation(subResult, tempResult, operation);
                if (char.isStringEqual(0x2b) || char.isStringEqual(0x2d)) { // '+' or '-' character
                    result += subResult;
                    subResult = 0;
                }
                tempResult = 0;
                operation = char;
            }
        }

        return (expIndex, result + performOperation(subResult, tempResult, operation));
    }

    /**
     * @dev Performs the arithmetic operation between two operands based on the given operator.
     * @param _subResult The current result of the sub-expression.
     * @param _tempResult The new operand to perform the operation with.
     * @param _operation The operator to apply on the operands.
     * @return The result of the arithmetic operation as an int256.
     */
    function performOperation(int256 _subResult, int256 _tempResult, bytes1 _operation) private pure returns (int256) {
        if (_operation == 0x2b) return _subResult + _tempResult; // '+' character
        if (_operation == 0x2d) return _subResult - _tempResult; // '-' character
        if (_operation == 0x2a) return _subResult * _tempResult; // '*' character
        return _subResult / _tempResult; // '/' character
    }
}

library StringUtils {
    /**
     * @dev Returns the length of a byte string.
     * @param _strBytes The byte string.
     * @return length - The length of the byte string as a uint256.
     */
    function stringLength(bytes memory _strBytes) internal pure returns (uint256 length) {
        assembly {
            length := mload(_strBytes)
        }
    }

    /**
     * @dev Retrieves the character at the specified index in a byte string.
     * @param _strBytes The byte string.
     * @param _index The index of the character.
     * @return The character at the given index as a bytes1.
     */
    function charAt(bytes memory _strBytes, uint256 _index) internal pure returns (bytes1) {
        if (_index >= _strBytes.length) {
            return "";
        }
        return _strBytes[_index];
    }

    /**
     * @dev Checks if a byte represents a digit character.
     * @param _char The byte character to check.
     * @return A boolean indicating whether the byte is a digit or not.
     */
    function isDigit(bytes1 _char) internal pure returns (bool) {
        return (_char >= 0x30 && _char <= 0x39); // Check if the byte is within the ASCII range for digits '0' to '9'
    }

    /**
     * @dev Compares two byte characters for equality.
     * @param _char The byte character to compare.
     * @param _op The byte character to compare against.
     * @return A boolean indicating whether the characters are equal or not.
     */
    function isStringEqual(bytes1 _char, bytes1 _op) internal pure returns (bool) {
        return _char == _op;
    }
}