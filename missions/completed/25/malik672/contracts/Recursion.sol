contract recusrsion {
    
    function eval(string memory s) public pure returns(uint256, int) {
       return calculate(bytes(s), 0);
    }

    
    function calculate(bytes memory ss, uint256 i) internal pure returns (uint256, int256) {
        int256 num = 0;
        int256 result = 0;
        int256 previous = 0;
        bytes1 sign = "+";
        uint256 length = 0;
        assembly {
            length := mload(ss)
        }
        
        for (; i < length; i++) {
          
            bytes1 char = ss[i];
            if (isDigit(char)) {
                num = num * 10 + parseInt(char);
            }
            if (!isDigit(char) || i == length - 1) {
                if (char == "(") {
                    (i, num) = calculate(ss, i + 1);
                }
                if (sign == "+") {
                    result += previous;
                    previous = num;
                } else if (sign == "-") {
                    result += previous;
                    previous = -num;
                } else if (sign == "*") {
                    previous *= num;
                } else if (sign == "/") {
                    previous = previous / num;
                }
                if (char == ")") {

                    return (i,  result+previous);
                }
                num = 0;
                sign = char;
            }
        }
        return (uint(result+previous), 0);
    }

    function isDigit(bytes1 _byte) internal pure returns (bool) {
        return (_byte >= 0x30 && _byte <= 0x39);
    }

    function parseInt(bytes1 _byte) internal pure returns (int256) {
        if (_byte == 0x30) {
            return 0;
        } else if (_byte == 0x31) {
            return 1;
        } else if (_byte == 0x32) {
            return 2;
        } else if (_byte == 0x33) {
            return 3;
        } else if (_byte == 0x34) {
            return 4;
        } else if (_byte == 0x35) {
            return 5;
        } else if (_byte == 0x36) {
            return 6;
        } else if (_byte == 0x37) {
            return 7;
        } else if (_byte == 0x38) {
            return 8;
        } else if (_byte == 0x39) {
            return 9;
        }
    }
}
