//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "./utils/ISupraOracle.sol";
import "./utils/IERC20.sol";
import "./utils/SafeERC20.sol";
import "./utils/SafeMath.sol";
import "./utils/Ownable.sol";

contract OrderBookDex is Ownable {
    using SafeERC20 for IERC20;

    ISupraOracle pricefeed;
    mapping(string => address) public tokenAddresses;

    constructor(address _pricefeed){
        pricefeed = ISupraOracle(_pricefeed);
    }

    function ratio(string memory numerator, string memory denominator)
        public
        view
        returns (int256)
    {
        string memory pairName = string.concat(numerator, "_", denominator);
        (int256 price, ) = pricefeed.checkPrice(pairName);
        return price;
    }

    function queryAmountOut(
        string memory fromTokenName,
        string memory toTokenName,
        uint256 _amount
    ) public view returns (int256) {
        if (
            keccak256(abi.encodePacked(fromTokenName)) ==
            keccak256(abi.encodePacked("usdt"))
        ) {
            int256 priceFlip = ratio(toTokenName, fromTokenName);
            int256 tokenAmountToUSDT = int256(_amount) * (int256(1e18) / priceFlip);
            return (tokenAmountToUSDT * 1e8) / 1e18;
        }

        if (
            keccak256(abi.encodePacked("usdt")) ==
            keccak256(abi.encodePacked(toTokenName))
        ) {
            int256 price = ratio(fromTokenName, toTokenName);
            int256 tokenAmountFromUSDT = int256(_amount) * (price);
            return tokenAmountFromUSDT / 1e8;
        }

        int256 price1 = ratio(fromTokenName, "usdt");
        int256 price2 = ratio(toTokenName, "usdt");
        int256 tokenAmount = int256(_amount) * ((price1 * 1e18) / price2);
        return tokenAmount / 1e18;
    }

    function swap(
        string memory _fromTokenName,
        string memory _toTokenName,
        uint256 _amount
    ) public {
        require(
            (tokenAddresses[_fromTokenName] != address(0) &&
                tokenAddresses[_toTokenName] != address(0)),
            "Tokens not available for swap"
        );
        uint256 returnAmount = uint256(
            queryAmountOut(_fromTokenName, _toTokenName, _amount)
        );
        require(returnAmount > 0, "Invalid price feed");
        require(
            returnAmount <= _getBalance(_toTokenName),
            "Insufficient Liquidity"
        );
        _safeTransferFrom(
            address(tokenAddresses[_fromTokenName]),
            address(msg.sender),
            address(this),
            _amount
        );
        _safeTransfer(
            address(tokenAddresses[_toTokenName]),
            address(msg.sender),
            returnAmount
        );

    }

    function addLiquidity(string memory _name, uint256 _amount) public {
        require(
            tokenAddresses[_name] != address(0),
            "Tokens not available for swap"
        );

        _safeTransferFrom(
            address(tokenAddresses[_name]),
            address(msg.sender),
            address(this),
            _amount
        );
    }

    function addTrustedTokens(address _token, string memory _name)
        public
        onlyOwner
    {
        tokenAddresses[_name] = _token;
    }

    function addTrustedTokensMulti(
        address[] memory _tokens,
        string[] memory _names
    ) public onlyOwner {
        require(_tokens.length == _names.length, "Invalid Names/Tokens");

        for (uint256 i = 0; i < _tokens.length; i++) {
            tokenAddresses[_names[i]] = _tokens[i];
        }
    }

    function _safeTransferFrom(
        address token,
        address from,
        address to,
        uint256 value
    ) private {
        IERC20(token).safeTransferFrom(address(from), address(to), value);
    }
        function _safeTransfer(
        address token,
        address to,
        uint256 value
    ) private {
        IERC20(token).safeTransfer( address(to), value);
    }

    function _getBalance(string memory _tokenName)
        internal
        view
        returns (uint256 balance)
    {
        balance = IERC20(tokenAddresses[_tokenName]).balanceOf(address(this));
    }
}
