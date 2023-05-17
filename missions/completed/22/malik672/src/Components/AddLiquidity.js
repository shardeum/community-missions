import React, { useState } from "react";
import { Signer, ethers } from "ethers";
import ERC20_ABI from "./erc20.json";
const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};
const NONFUNGIBLE_POSITION_MANAGER =
  "0xE84BAf6e4D204282f7b47444dA69d0200fe97CD5";

const provider = new ethers.providers.Web3Provider(window.ethereum);
// Create signer and contract instances
const signer = provider.getSigner();

const AddLiquiditys = () => {
  const [tokenID, setTokenID] = useState("");
  const [tokenAs, setTokenA] = useState("");
  const [tokenBs, setTokenB] = useState("");
  const [poolAddress, setPoolAddress] = useState("");
  const [amount0Desired, setAmount0Desired] = useState("");
  const [amount1Desired, setAmount1Desired] = useState("");

  const add = async(e) => {
    e.preventDefault();
    const nonfungiblePositionManager = new ethers.Contract(
      NONFUNGIBLE_POSITION_MANAGER,
      artifacts.NonfungiblePositionManager.abi,
      signer
    );
    const position = await nonfungiblePositionManager.connect(signer).positions(
       tokenID
    )
    const totalLiquidity = await position.liquidity.toString();
    const halfLiquidity = await parseInt(totalLiquidity / 2);
   
    const params ={
        tokenId: tokenID,
        // liquidity: halfLiquidity,
        amount0Desired:ethers.utils.parseEther(amount0Desired),
        amount1Desired:ethers.utils.parseEther(amount1Desired),
        amount0Min:0,
        amount1Min:0,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10),
    }

    const increase = nonfungiblePositionManager.connect(signer).increaseLiquidity(
        params
    )
  };
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
    <h2 className="text-2xl font-medium mb-4">Add Liquidity</h2>
    <div className="mb-4">
      <label
        htmlFor="token1Amount"
        className="text-gray-700 font-medium mb-2 block"
      >
        Token Id
      </label>
      <input
        type="text"
        id="token1Address"
        className="w-full border border-gray-400 p-2 rounded-lg"
        onChange={(e) => setTokenID(e.target.value)}
      />
    </div>
    <div className="mb-4">
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
      onClick={(e) => add(e)}
    >
      Add Liquidity
    </button>
  </div>
  );
};

export default AddLiquiditys;
