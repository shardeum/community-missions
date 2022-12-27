pragma solidity ^0.8.17;
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

interface ISupraSValueFeed {
    function checkPrice(string memory marketPair)
        external
        view
        returns (int256 price, uint256 timestamp);
}

contract OrderBookDex {
    address USDTAddress;
    address BTCAddress;

    ISupraSValueFeed internal sValueFeed;

    constructor(address _USDTAddress, address _BTCAddress) {
        USDTAddress = _USDTAddress;
        BTCAddress = _BTCAddress;
        sValueFeed = ISupraSValueFeed(
            0x700a89Ba8F908af38834B9Aba238b362CFfB665F
        );
    }

    function swap(
        address wallet,
        address _from,
        address _to,
        uint256 _amount
    ) public {
        if (_from == USDTAddress && _to == BTCAddress) {
            //check if the caller has enough USDT to perform the swap
            require(
                IERC20(USDTAddress).balanceOf(wallet) >= _amount,
                "Insufficient USTD balance"
            );

            //transfer usdt from the caller to the contract
            IERC20(USDTAddress).transferFrom(wallet, address(this), _amount);

            //transfer equivalent amount of BTC from the contract to the caller
            IERC20(BTCAddress).transfer(
                wallet,
                SafeMath.div(_amount, getUsdtBtcPrice())
            );
        } else {
            //check if the caller has enough BTC to perform the swap
            require(
                IERC20(BTCAddress).balanceOf(wallet) >= _amount,
                "Insufficient BTC balance"
            );

            //transfer BTC from the caller to the contract
            IERC20(BTCAddress).transferFrom(wallet, address(this), _amount);

            //transfer equivalent amount of USDT from the contract to the caller
            IERC20(USDTAddress).transfer(
                wallet,
                SafeMath.div(_amount, getUsdtBtcPrice())
            );
        }
    }

    function getUsdtBtcPrice() public view returns (uint256) {
        (int256 price, ) = sValueFeed.checkPrice("btc_usdt");

        return uint256(price);
    }

    function getUSDTBalance(address wallet) public view returns (uint256) {
        return ERC20(USDTAddress).balanceOf(wallet);
    }

    function getBTCBalance(address wallet) public view returns (uint256) {
        return ERC20(BTCAddress).balanceOf(wallet);
    }
}
