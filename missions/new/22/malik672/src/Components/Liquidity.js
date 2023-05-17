import React, { useState } from "react";
import ERC20_ABI from "./erc20.json";
import { Signer, ethers } from "ethers";
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};
const { Contract, BigNumber } = require("ethers");
const bn = require("bignumber.js");
bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 });
const v3Factory = "0xf3f57d5e4F7b396c89B38ab344e00BF7fbEF33bf";
const NONFUNGIBLE_POSITION_MANAGER =
  "0xE84BAf6e4D204282f7b47444dA69d0200fe97CD5";
const { Token } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");

const Liquidity = () => {
  const [tokenAs, setTokenA] = useState("");
  const [tokenBs, setTokenB] = useState("");
  const [poolAddress, setPoolAddress] = useState("");
  const [amount0Desired, setAmount0Desired] = useState("");
  const [amount1Desired, setAmount1Desired] = useState("");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // Create signer and contract instances
  const signer = provider.getSigner();

  const data = async (poolContract) => {
    const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
      poolContract.tickSpacing(),
      poolContract.fee(),
      poolContract.liquidity(),
      poolContract.slot0(),
    ]);
    return {
      tickSpacing: tickSpacing,
      fee: fee,
      liquidity: liquidity,
      sqrtPriceX96: slot0[0],
      tick: slot0[1],
    };
  };

  const main = async () => {
    const token1s = new ethers.Contract(
      tokenAs,
      ERC20_ABI,
      signer,
      ethers.utils.parseEther("1000")
    );
    const token2s = new ethers.Contract(tokenBs, ERC20_ABI, signer);

    await token1s.connect(signer).approve(NONFUNGIBLE_POSITION_MANAGER, ethers.utils.parseEther("1000"));
    await token2s.connect(signer).approve(NONFUNGIBLE_POSITION_MANAGER, ethers.utils.parseEther("1000"));

    const poolContract = new ethers.Contract(
      poolAddress,
      artifacts.UniswapV3Pool.abi,
      signer
    );
      

    const poolData = await data(poolContract);
    const Token_1 = new Token(31337, tokenAs, 18, "redhue", "jue");
    const Token_2 = new Token(31337, tokenBs, 18, "blue", "ivy");
    console.log(Token_1, Token_2)

    const pool = new Pool(
      Token_1,
      Token_2,
      poolData.fee,
      poolData.sqrtPriceX96.toString(),
      poolData.liquidity.toString(),
      poolData.tick
    );

    const position = new Position({
      pool: pool,
      liquidity: ethers.utils.parseEther("1"),
      tickLower:
        nearestUsableTick(poolData.tick, poolData.tickSpacing) -
        poolData.tickSpacing * 2,
      tickUpper:
        nearestUsableTick(poolData.tick, poolData.tickSpacing) +
        poolData.tickSpacing * 2,
    });

    const { amount0: amount0Desired, amount1: amount1Desired } =
      position.mintAmounts;

    let params = {
      token0: tokenAs,
      token1: tokenBs,
      fee: poolData.fee,
      tickLower:
        nearestUsableTick(poolData.tick, poolData.tickSpacing) -
        poolData.tickSpacing * 2,
      tickUpper:
        nearestUsableTick(poolData.tick, poolData.tickSpacing) +
        poolData.tickSpacing * 2,
      amount0Desired: amount0Desired.toString(),
      amount1Desired: amount1Desired.toString(),
      amount0Min: 0,
      amount1Min: 0,
      recipient: window.ethereum.selectedAddress,
      deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    };

    console.log(params, signer)
    const nonfungiblePositionManager = new Contract(
      NONFUNGIBLE_POSITION_MANAGER,
      artifacts.NonfungiblePositionManager.abi,
      signer
    );

    // const positions = nonfungiblePositionManager.connect(signer)
   console.log(nonfungiblePositionManager)
    const tx = await nonfungiblePositionManager
      .mint(params);

    // // const receipt = await tx.wait();
    // // console.log(receipt);
  };
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-medium mb-4">Mint Position</h2>

      <div className="mb-4">
        <label
          htmlFor="token1Amount"
          className="text-gray-700 font-medium mb-2 block"
        >
          Pool's Address
        </label>
        <input
          type="text"
          id="token1Address"
          className="w-full border border-gray-400 p-2 rounded-lg"
          onChange={(e) => setPoolAddress(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="token1Amount"
          className="text-gray-700 font-medium mb-2 block"
        >
          Token 1 Address:
        </label>
        <input
          type="text"
          id="token1Address"
          className="w-full border border-gray-400 p-2 rounded-lg"
          onChange={(e) => setTokenA(e.target.value)}
        />
        <label
          htmlFor="token1Amount"
          className="text-gray-700 font-medium mt-4 mb-2 block"
        >
          Token 1 Amount:
        </label>
        <input
          type="number"
          id="token1Amount"
          className="w-full border border-gray-400 p-2 rounded-lg"
          onChange={(e) => setAmount0Desired(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="token2Amount"
          className="text-gray-700 font-medium mb-2 block"
        >
          Token 2 Address:
        </label>
        <input
          type="text"
          id="token2Address"
          className="w-full border border-gray-400 p-2 rounded-lg"
          onChange={(e) => setTokenB(e.target.value)}
        />
        <label
          htmlFor="token2Amount"
          className="text-gray-700 font-medium mt-4 mb-2 block"
        >
          Token 2 Amount:
        </label>
        <input
          type="number"
          id="token2Amount"
          className="w-full border border-gray-400 p-2 rounded-lg"
          onChange={(e) => setAmount1Desired(e.target.value)}
        />
      </div>
      <button
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
        onClick={(e) => main(e)}
      >
        Add Liquidity
      </button>
    </div>
  );
};

export default Liquidity;
