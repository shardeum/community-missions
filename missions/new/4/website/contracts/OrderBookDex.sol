pragma solidity ^0.8.7;
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
    address AAVEAddress;
    address ADAAddress;
    address ALGOAddress;
    address ATOMAdress;
    address AUDAddress;
    address AVAXAddress;
    address BALAddress;
    address BANDAddress;
    address BATAddress;
    address BCHAddress;
    address BNBAddress;
    address ETHAddress;
    address FILAddress;
    address MATICAddress;
    address SOLAddress;

    ISupraSValueFeed internal sValueFeed;

    constructor(
        address _USDTAddress,
        address _BTCAddress,
        address _AAVEAddress,
        address _ADAAddress,
        address _ALGOAddress,
        address _ATOMAdress,
        address _AUDAddress,
        address _AVAXAddress,
        address _BALAddress,
        address _BANDAddress,
        address _BATAddress,
        address _BCHAddress,
        address _BNBAddress,
        address _ETHAddress,
        address _FILAddress,
        address _MATICAddress,
        address _SOLAddress
    ) {
        USDTAddress = _USDTAddress;
        BTCAddress = _BTCAddress;
        AAVEAddress = _AAVEAddress;
        ADAAddress = _ADAAddress;
        ALGOAddress = _ALGOAddress;
        ATOMAdress = _ATOMAdress;
        AUDAddress = _AUDAddress;
        AVAXAddress = _AVAXAddress;
        BALAddress = _BALAddress;
        BANDAddress = _BANDAddress;
        BATAddress = _BATAddress;
        BCHAddress = _BCHAddress;
        BNBAddress = _BNBAddress;
        ETHAddress = _ETHAddress;
        FILAddress = _FILAddress;
        MATICAddress = _MATICAddress;
        SOLAddress = _SOLAddress;
        sValueFeed = ISupraSValueFeed(
            0x700a89Ba8F908af38834B9Aba238b362CFfB665F
        );
    }

    function ratio(string memory numerator, string memory denominator)
        public
        view
        returns (uint256)
    {
        string memory pairName = string.concat(numerator, "_", denominator);
        (int256 price, ) = sValueFeed.checkPrice(pairName);
        return uint256(price);
    }

    function swap(
        address wallet,
        address _from,
        address _to,
        uint256 _amount
    ) public {
        if (_from == BTCAddress && _to == USDTAddress) {
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
                SafeMath.div(_amount, ratio("btc", "usdt"))
            );
        } else if (_from == ALGOAddress && _to == USDTAddress) {
            require(
                IERC20(ALGOAddress).balanceOf(wallet) >= _amount,
                "Insufficient ALGO balance"
            );

            IERC20(ALGOAddress).transferFrom(wallet, address(this), _amount);

            IERC20(USDTAddress).transfer(
                wallet,
                SafeMath.div(_amount, ratio("algo", "usdt"))
            );
        } else if (_from == ATOMAdress && _to == USDTAddress) {
            require(
                IERC20(ATOMAdress).balanceOf(wallet) >= _amount,
                "Insufficient ATOM balance"
            );

            IERC20(ATOMAdress).transferFrom(wallet, address(this), _amount);

            IERC20(USDTAddress).transfer(
                wallet,
                SafeMath.div(_amount, ratio("atom", "usdt"))
            );
        } else if (_from == AVAXAddress && _to == USDTAddress) {
            require(
                IERC20(AVAXAddress).balanceOf(wallet) >= _amount,
                "Insufficient AVAX balance"
            );

            IERC20(AVAXAddress).transferFrom(wallet, address(this), _amount);

            IERC20(USDTAddress).transfer(
                wallet,
                SafeMath.div(_amount, ratio("avax", "usdt"))
            );
        } else if (_from == BCHAddress && _to == USDTAddress) {
            require(
                IERC20(BCHAddress).balanceOf(wallet) >= _amount,
                "Insufficient BCH balance"
            );

            IERC20(BCHAddress).transferFrom(wallet, address(this), _amount);

            IERC20(USDTAddress).transfer(
                wallet,
                SafeMath.div(_amount, ratio("bch", "usdt"))
            );
        } else if (_from == BNBAddress && _to == USDTAddress) {
            require(
                IERC20(BNBAddress).balanceOf(wallet) >= _amount,
                "Insufficient BNB balance"
            );

            IERC20(BNBAddress).transferFrom(wallet, address(this), _amount);

            IERC20(USDTAddress).transfer(
                wallet,
                SafeMath.div(_amount, ratio("bnb", "usdt"))
            );
        } else if (_from == ETHAddress && _to == USDTAddress) {
            require(
                IERC20(ETHAddress).balanceOf(wallet) >= _amount,
                "Insufficient ETH balance"
            );

            IERC20(ETHAddress).transferFrom(wallet, address(this), _amount);

            IERC20(USDTAddress).transfer(
                wallet,
                SafeMath.div(_amount, ratio("eth", "usdt"))
            );
        } else if (_from == MATICAddress && _to == USDTAddress) {
            require(
                IERC20(MATICAddress).balanceOf(wallet) >= _amount,
                "Insufficient MATIC balance"
            );

            IERC20(MATICAddress).transferFrom(wallet, address(this), _amount);

            IERC20(USDTAddress).transfer(
                wallet,
                SafeMath.div(_amount, ratio("matic", "usdt"))
            );
        } else if (_from == SOLAddress && _to == USDTAddress) {
            require(
                IERC20(SOLAddress).balanceOf(wallet) >= _amount,
                "Insufficient SOL balance"
            );

            IERC20(SOLAddress).transferFrom(wallet, address(this), _amount);

            IERC20(USDTAddress).transfer(
                wallet,
                SafeMath.div(_amount, ratio("sol", "usdt"))
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
