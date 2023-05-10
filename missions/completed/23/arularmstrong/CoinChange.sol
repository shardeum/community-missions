pragma solidity 0.8.7;

contract CoinChange {

    function changeReturn(uint256 amountDue, uint256 amountPaid) public pure returns (uint256[] memory coins) {
        if (amountDue > amountPaid) revert InvalidInput();

        coins = new uint256[](4);
        
        assembly {
            let changeDue := sub(amountPaid, amountDue)
            // quarters
            let quarters := div(changeDue, 25)
            mstore(add(coins, 0x20), quarters)
            changeDue := mod(changeDue, 25)
            
            // dimes
            let dimes := div(changeDue, 10)
            mstore(add(coins, 0x40), dimes)
            changeDue := mod(changeDue, 10)
            
            // nickels
            let nickels := div(changeDue, 5)
            mstore(add(coins, 0x60), nickels)
            changeDue := mod(changeDue, 5)
            
            // pennies
            mstore(add(coins, 0x80), changeDue)
        }
    }

    error InvalidInput();
}