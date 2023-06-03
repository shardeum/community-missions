import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "@nomicfoundation/hardhat-chai-matchers";
import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";

dotenv.config({ path: __dirname + "/.env" });

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    ShardeumSphinx: {
      url: `https://sphinx.shardeum.org`,
      chainId: 8082,
      accounts: [process.env.PRIV_KEY!],
      timeout: 2_147_483_647,
    },
  },
};

export default config;
