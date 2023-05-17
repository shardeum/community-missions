import React, { useState } from "react";
import liquidity from "./pool.json";
import { BigNumber } from "ethers";
import Web3 from "web3";
import ERC20_ABI from "./erc20.json";
import { ethers } from "ethers";
const bn = require("bignumber.js");
const v3Factory = "0xf3f57d5e4F7b396c89B38ab344e00BF7fbEF33bf";
const NONFUNGIBLE_POSITION_MANAGER =
  "0xE84BAf6e4D204282f7b47444dA69d0200fe97CD5";
const { Pool, Position, nearestUsableTick } = require('@uniswap/v3-sdk')
const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });

const Pools = () => {
  const [tokenAs, setTokenA] = useState("");
  const [tokenBs, setTokenB] = useState("");
  const [amountTokenA, setAmountTokenA] = useState("");
  const [amountTokenB, setAmountTokenB] = useState("");
  const [tickSpacing, setTickSpacing] = useState(10);
  const [initialLiquidity, setInitialLiquidity] = useState("");

  function encodePriceSqrt(reserve1, reserve0) {
    return BigNumber.from(
      new bn(reserve1.toString())
        .div(reserve0.toString())
        .sqrt()
        .multipliedBy(new bn(2).pow(96))
        .integerValue(3)
        .toString()
    );
  }

  const createPools = async (e) => {
    console.log(encodePriceSqrt(40, 40));
    e.preventDefault();
    // Connect to provider (e.g. Metamask)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.enable();
    const slippage = 1;
    // Create signer and contract instances
    const signer = provider.getSigner();
    const v3liquidity = new ethers.Contract(v3Factory, liquidity, signer);
    const tokenContract = new ethers.Contract(
      tokenAs,
      ERC20_ABI,
      signer
    )
    const tokenContracts = new ethers.Contract(
      tokenBs,
      ERC20_ABI,
      signer
    )
    const transaction = await tokenContract.approve(
      NONFUNGIBLE_POSITION_MANAGER,
      1000
    )
    const transactions = await tokenContracts.approve(
      NONFUNGIBLE_POSITION_MANAGER,
      1000
    )
    console.log(transaction)
    const nonfungiblePositionManager = new ethers.Contract(
      NONFUNGIBLE_POSITION_MANAGER,
      artifacts.NonfungiblePositionManager.abi,
      signer
    );
    console.log(nonfungiblePositionManager)
    const createdPool = await nonfungiblePositionManager
      .connect(signer)
      .createAndInitializePoolIfNecessary(
        tokenAs,
        tokenBs,
        100,
        encodePriceSqrt(amountTokenB,amountTokenA),
      );
  const factory = new ethers.Contract(
      v3Factory,
      artifacts.UniswapV3Factory.abi,
      signer
    );
    const poolAddress = await factory.connect(signer).getPool(
      tokenAs,
      tokenBs,
      100,
    )
    console.log(poolAddress)
  
    const factorys = new ethers.Contract(
      v3Factory,
      artifacts.UniswapV3Factory.abi,
      signer
    )

    const poolAddresss = await factorys.connect(signer).getPool(
      tokenAs,
      tokenBs,
      100
    )
    console.log(poolAddress)

    console.log(await createdPool.wait());
    // // Get current user address
  };

  return (
    <div>
      <form className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4">Create Uniswap v3 Pool</h2>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="token0"
          >
            Token 0
          </label>
          <input
            type="text"
            onChange={(e) => setTokenA(e.target.value)}
            name="token0"
            placeholder="Token 0"
            className="w-full border border-gray-400 p-2 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="token1"
          >
            Token 1
          </label>
          <input
            type="text"
            onChange={(e) => setTokenB(e.target.value)}
            name="token1"
            placeholder="Token 1"
            className="w-full border border-gray-400 p-2 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="price">
            Price
          </label>
          <input
            type="number"
            onChange={(e) => setAmountTokenB(e.target.value)}
            name="price"
            placeholder="Price"
            className="w-full border border-gray-400 p-2 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-bold mb-2"
            htmlFor="amount"
          >
            Amount
          </label>
          <input
            type="number"
            onChange={(e) => setAmountTokenA(e.target.value)}
            name="amount"
            placeholder="Amount"
            className="w-full border border-gray-400 p-2 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={(e) => createPools(e)}
        >
          Create Pool
        </button>
      </form>
    </div>
  );
};

export default Pools;
