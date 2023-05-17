import React, { useState } from "react";
import swapRouterAbi from "./abi.json";
import erc20Abi from "./erc20.json";
import Web3 from "web3";
import { ethers } from "ethers";
import {AlphaRouter} from "@uniswap/smart-order-router";
const UNISWAP = require("@uniswap/sdk");
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};
const { Token } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");

// Replace CONTRACT_ADDRESS with the actual address of your contract
const SWAP_ROUTER_CONTRACT_ADDRESS =
  "0x4188C9093D88A02d04c475D7224c31eD30df52ce";

function Swap() {
  // State variables for user input
  const [tokenAs, setTokenA] = useState("");
  const [tokenBs, setTokenB] = useState("");
  const [poolAddress, setPoolAddress] = useState("");
  const [amount0Desired, setAmount0Desired] = useState("");
  const [amount1Desired, setAmount1Desired] = useState("");

  // Connect to provider (e.g. Metamask)
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const slippage = 1;
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

  // Function to handle token swap
  const handleSwap = async () => {
    await window.ethereum.enable();

    const swapRouter = new ethers.Contract(
      SWAP_ROUTER_CONTRACT_ADDRESS,
      swapRouterAbi,
      signer
    );

    const poolContract = new ethers.Contract(
      poolAddress,
      artifacts.UniswapV3Pool.abi,
      signer
    );

    const Token_1 = new Token(31337, tokenAs, 18, "redhue", "jue");
    const Token_2 = new Token(31337, tokenBs, 18, "blue", "ivy");

    // const poolData = await data(poolContract);
    // console.log(Token_1, Token_2);

    // const pool = new Pool(
    //   Token_1,
    //   Token_2,
    //   poolData.fee,
    //   poolData.sqrtPriceX96.toString(),
    //   poolData.liquidity.toString(),
    //   poolData.tick
    // );

    // // Calculate amount
    const amountsIn = ethers.utils.parseUnits(amount0Desired, 18);
 
    // Get current user address
    const userAddress = await signer.getAddress();

    const tokenInContract = new ethers.Contract(tokenAs, erc20Abi, signer);
    const allowance = await tokenInContract.allowance(
      userAddress,
      SWAP_ROUTER_CONTRACT_ADDRESS
    );
    if (allowance.lt(amountsIn)) {
      const approveTx = await tokenInContract.approve(
        SWAP_ROUTER_CONTRACT_ADDRESS,
        amountsIn
      );
      await approveTx.wait();
    }
    console.log(swapRouter)

    const params = {
      tokenIn: tokenAs,
      tokenOut: tokenBs,
      fee:100,
      recipient:window.ethereum.selectedAddress,
      deadline:Math.floor(Date.now() / 1000) + 60 * 10,
      amountIn: amount0Desired,
      amountOutMinimum:0,
      sqrtPriceLimitX96:0,

    }
    
    const transaction = swapRouter.connect(signer).exactInputSingle(
      params,
    )
    console.log(transaction)
    
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
    <h2 className="text-2xl font-medium mb-4">Swap</h2>

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
    </div>
    <button
      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
      onClick={(e) => handleSwap(e)}
    >
      Swap
    </button>
  </div>
  );
}

export default Swap;
