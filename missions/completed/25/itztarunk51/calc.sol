// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StringInputCalculator {
    int256 private contractResult; // Renamed private variable
    
    function evaluate(string memory expression) public pure returns (int256) {
        string[] memory rpn = toRPN(expression);
        int256[] memory stack = new int256[](rpn.length);
        uint256 top = 0;
        
        for (uint256 i = 0; i < rpn.length; i++) {
            if (isNumber(rpn[i])) {
                stack[top++] = parseInt(rpn[i]);
            } else {
                int256 b = stack[--top];
                int256 a = stack[--top];
                stack[top++] = applyOperator(a, bytes(rpn[i])[0], b);
            }
        }
        
        return stack[0];
    }
    
    function toRPN(string memory expression) internal pure returns (string[] memory) {
        bytes memory b = bytes(expression);
        string[] memory output = new string[](b.length);
        uint256 outputLength = 0;
        bytes1[] memory operatorStack = new bytes1[](b.length);
        uint256 operatorStackLength = 0;
        
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] >= "0" && b[i] <= "9") {
                uint256 start = i;
                while (i < b.length && b[i] >= "0" && b[i] <= "9") {
                    i++;
                }
                output[outputLength++] = substring(expression, start, i);
                i--;
            } else if (b[i] == "+" || b[i] == "-" || b[i] == "*" || b[i] == "/") {
                while (operatorStackLength > 0 && precedence(operatorStack[operatorStackLength - 1]) >= precedence(b[i])) {
                    output[outputLength++] = string(abi.encodePacked(operatorStack[--operatorStackLength]));
                }
                operatorStack[operatorStackLength++] = b[i];
            } else if (b[i] == "(") {
                operatorStack[operatorStackLength++] = b[i];
            } else if (b[i] == ")") {
                while (operatorStackLength > 0 && operatorStack[operatorStackLength - 1] != "(") {
                    output[outputLength++] = string(abi.encodePacked(operatorStack[--operatorStackLength]));
                }
                operatorStackLength--;
            }
        }
        
        while (operatorStackLength > 0) {
            output[outputLength++] = string(abi.encodePacked(operatorStack[--operatorStackLength]));
        }
        
        return slice(output, 0, outputLength);
    }
    
    function isNumber(string memory s) internal pure returns (bool) {
        bytes memory b = bytes(s);
        return b.length > 0 && b[0] >= "0" && b[0] <= "9";
    }
    
    function parseInt(string memory s) internal pure returns (int256) {
        bytes memory b = bytes(s);
        int256 result = 0;
        
        for (uint256 i = 0; i < b.length; i++) {
            result = result * 10 + int256(uint256(uint8(b[i])) - 48);
        }
        
        return result;
    }
    
    function applyOperator(int256 a, bytes1 op, int256 b) internal pure returns (int256) {
        if (op == "+") {
            return a + b;
        } else if (op == "-") {
            return a - b;
        } else if (op == "*") {
            return a * b;
        } else if (op == "/") {
            return a / b;
        } else {
            revert("Invalid operator");
        }
    }
    
    function precedence(bytes1 op) internal pure returns (uint256) {
        if (op == "+" || op == "-") {
            return 1;
        } else if (op == "*" || op == "/") {
            return 2;
        } else {
            return 0;
        }
    }
    
    function substring(string memory s, uint256 start, uint256 end) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        bytes memory result = new bytes(end - start);
        
        for (uint256 i = start; i < end; i++) {
            result[i - start] = b[i];
        }
        
        return string(result);
    }
    
    function slice(string[] memory arr, uint256 start, uint256 end) internal pure returns (string[] memory) {
        string[] memory result = new string[](end - start);
        
        for (uint256 i = start; i < end; i++) {
            result[i - start] = arr[i];
        }
        
        return result;
    }
}
