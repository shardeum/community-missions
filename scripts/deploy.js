// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  //USDT Token
  const USDToken = await hre.ethers.getContractFactory("USDToken");
  const USDTokenContract = await USDToken.deploy(100000000);
  await USDTokenContract.deployed();

  //tranfer token to user
  await USDTokenContract.transferToken(
    "0x1E8711053D9BA4Ac94466212081f8568930c9C61",
    10000
  );

  //BTC Token
  const BTCToken = await hre.ethers.getContractFactory("BTCToken");
  const BTCTokenContract = await BTCToken.deploy(100000000);
  await BTCTokenContract.deployed();

  //transfer token to user
  await BTCTokenContract.transferToken(
    "0x1E8711053D9BA4Ac94466212081f8568930c9C61",
    10000
  );

  const OrderBookDex = await hre.ethers.getContractFactory("OrderBookDex");
  const OrderBookDexcontract = await OrderBookDex.deploy(
    USDTokenContract.address,
    BTCTokenContract.address
  );
  await OrderBookDexcontract.deployed();

  //transfer tokens to contract
  await USDTokenContract.transferToken(OrderBookDexcontract.address, 5000000);

  await BTCTokenContract.transferToken(OrderBookDexcontract.address, 5000000);

  //approve contract to transfer tokens
  await USDTokenContract.approve(OrderBookDexcontract.address, 5000000);
  await BTCTokenContract.approve(OrderBookDexcontract.address, 5000000);

  const USDTBalance = await OrderBookDexcontract.getUSDTBalance(
    "0x1E8711053D9BA4Ac94466212081f8568930c9C61"
  );

  const BTCBalance = await OrderBookDexcontract.getBTCBalance(
    "0x1E8711053D9BA4Ac94466212081f8568930c9C61"
  );

  console.log("USDT Token Address", USDTokenContract.address);
  console.log("BTC Token Address", BTCTokenContract.address);
  console.log("Dex Contract Address", OrderBookDexcontract.address);
  console.log("USDT Balance", USDTBalance);
  console.log("BTC Balance", BTCBalance);

  // //Swap Tokens
  // await OrderBookDexcontract.swap(
  //   "0xe2ae65b82C3B7750923a9338B9C18A1EDFe86a8a",
  //   USDTokenContract.address,
  //   BTCTokenContract.address,
  //   10
  // );

  // const USDTBalanceAfterSwap = await OrderBookDexcontract.getUSDTBalance(
  //   "0xe2ae65b82C3B7750923a9338B9C18A1EDFe86a8a"
  // );

  // const BTCBalanceAfterSwap = await OrderBookDexcontract.getBTCBalance(
  //   "0xe2ae65b82C3B7750923a9338B9C18A1EDFe86a8a"
  // );

  // console.log("USDT Balance After Swap", USDTBalanceAfterSwap);
  // console.log("BTC Balance After Swap", BTCBalanceAfterSwap);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
