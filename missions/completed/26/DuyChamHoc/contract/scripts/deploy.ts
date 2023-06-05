import { ethers, hardhatArguments } from 'hardhat';
import * as Config from './config';
async function main() {
  await Config.initConfig();
  const network = hardhatArguments.network ? hardhatArguments.network : 'dev';
  const [deployer] = await ethers.getSigners();
  console.log('deploy from address: ', deployer.address);


  const WordBreak = await ethers.getContractFactory("WordBreak");
  const wordBreak: any = await WordBreak.deploy();
  console.log('stman verify address: ', wordBreak.address);
  Config.setConfig(network + '.WordBreak', wordBreak.address);


  await Config.updateConfig();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });