const hre = require("hardhat");

async function main() {
  const WordMix = await hre.ethers.getContractFactory("WordMixValidator");

  const WordMixV= await WordMix.deploy();

  await WordMixV.deployed();
  console.log(`WordMixValidator contract address: ${WordMixV.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });