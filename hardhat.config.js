require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    shardeum: {
      url: "https://liberty20.shardeum.org/",
      chainId: 8081,
      accounts: [
        "1fda74ba6d14b673698060257c854ff3f11a3f9f385f7e825f6131bc2c0bca39",
      ],
    },

    polygon: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [
        "1fda74ba6d14b673698060257c854ff3f11a3f9f385f7e825f6131bc2c0bca39",
      ],
    },
  },
};
