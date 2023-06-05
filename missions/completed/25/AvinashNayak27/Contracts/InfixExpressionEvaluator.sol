// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InfixExpressionEvaluator {
    function evaluate(string memory expression) public pure returns (int256) {
        bytes memory exp = bytes(expression);
        uint256 length = exp.length;

        // Separate the expression into operands and operators
        uint256[] memory operands;
        bytes memory operators;
        for (uint256 i = 0; i < length; i++) {
            bytes1 token = exp[i];

            if (isOperator(token)) {
                operators = abi.encodePacked(operators, token);
            } else if (isDigit(token)) {
                uint256 operand = 0;
                while (i < length && isDigit(exp[i])) {
                    operand = operand * 10 + uint8(exp[i]) - uint8(bytes1("0"));
                    i++;
                }
                operands = append(operands, operand);
                i--; // To counter the increment in the for loop
            } else if (token == bytes1("(")) {
                // Find the corresponding closing parenthesis
                uint256 closingIndex = findClosingParenthesis(exp, i);
                // Extract the subexpression within the parentheses
                string memory subExpression = substring(expression, i + 1, closingIndex - 1);
                // Recursively evaluate the subexpression
                uint256 subResult = uint256(evaluate(subExpression));
                operands = append(operands, subResult);
                i = closingIndex; // Move the loop index to after the closing parenthesis
            }
        }

        // Evaluate the expression based on operator precedence
        while (operators.length > 0) {
            uint256 operatorIndex = findHighestPrecedenceOperator(operators);
            bytes1 operator = operators[operatorIndex];
            uint256 operand1 = operands[operatorIndex];
            uint256 operand2 = operands[operatorIndex + 1];
            uint256 result;

            if (operator == bytes1("*")) {
                result = operand1 * operand2;
            } else if (operator == bytes1("/")) {
                result = operand1 / operand2;
            } else if (operator == bytes1("+")) {
                result = operand1 + operand2;
            } else if (operator == bytes1("-")) {
                result = operand1 - operand2;
            }

            // Update operands and operators arrays with the result of the evaluated expression
            operands[operatorIndex] = result;
            operands = removeElementAtIndex(operands, operatorIndex + 1);
            operators = removeElementAtIndex(operators, operatorIndex);
        }

        return int256(operands[0]);
    }

    function isOperator(bytes1 token) private pure returns (bool) {
        return token == bytes1("+") || token == bytes1("-") || token == bytes1("*") || token == bytes1("/");
    }

    function isDigit(bytes1 token) private pure returns (bool) {
        return token >= bytes1("0") && token <= bytes1("9");
    }

    function append(uint256[] memory array, uint256 element) private pure returns (uint256[] memory) {
        uint256[] memory newArray = new uint256[](array.length + 1);
        for (uint256 i = 0; i < array.length; i++) {
            newArray[i] = array[i];
        }
        newArray[array.length] = element;
        return newArray;
    }

    function findClosingParenthesis(bytes memory expression, uint256 startIndex) private pure returns (uint256) {
        uint256 length = expression.length;
        uint256 openCount = 1;

        for (uint256 i = startIndex + 1; i < length; i++) {
            if (expression[i] == bytes1("(")) {
                openCount++;
            } else if (expression[i] == bytes1(")")) {
                openCount--;
                if (openCount == 0) {
                    return i;
                }
            }
        }

        revert("Unbalanced parentheses");
    }

    function substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) private pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        require(endIndex >= startIndex, "Invalid substring range");
        require(endIndex < strBytes.length, "End index out of bounds");

        bytes memory result = new bytes(endIndex - startIndex + 1);
        for (uint256 i = startIndex; i <= endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }

        return string(result);
    }

    function findHighestPrecedenceOperator(bytes memory operators) private pure returns (uint256) {
        uint256 operatorIndex = 0;
        bytes1 highestPrecedenceOperator = operators[operatorIndex];
        for (uint256 i = 1; i < operators.length; i++) {
            bytes1 operator = operators[i];
            if (isOperatorOfHigherPrecedence(operator, highestPrecedenceOperator)) {
                highestPrecedenceOperator = operator;
                operatorIndex = i;
            }
        }
        return operatorIndex;
    }

    function isOperatorOfHigherPrecedence(bytes1 operator1, bytes1 operator2) private pure returns (bool) {
        return (operator1 == bytes1("*") || operator1 == bytes1("/")) &&
            (operator2 == bytes1("+") || operator2 == bytes1("-"));
    }

    function removeElementAtIndex(uint256[] memory array, uint256 index)
        private
        pure
        returns (uint256[] memory)
    {
        uint256[] memory newArray = new uint256[](array.length - 1);
        for (uint256 i = 0; i < index; i++) {
            newArray[i] = array[i];
        }
        for (uint256 i = index + 1; i < array.length; i++) {
            newArray[i - 1] = array[i];
        }
        return newArray;
    }

    function removeElementAtIndex(bytes memory array, uint256 index) private pure returns (bytes memory) {
        bytes memory newArray = new bytes(array.length - 1);
        for (uint256 i = 0; i < index; i++) {
            newArray[i] = array[i];
        }
        for (uint256 i = index + 1; i < array.length; i++) {
            newArray[i - 1] = array[i];
        }
        return newArray;
    }
}
