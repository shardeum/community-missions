import { useWeb3React } from "@web3-react/core";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import blockchains from "../config/blockchains.json";
import { ChainId } from "../config/chainIds";
import { NETWORK_ICON, NETWORK_LABEL } from "../config/networks";
import { injected, supportedChainIds, wallets } from "../config/wallets";
import useWeb3 from "../hooks/useWeb3";
import TokenSelectionModal from "../components/TokenSelectionModal";
import tokenList from "../config/tokenList.json";
import OrderBookDexABI from "../config/abis/OrderBookDexABI.json";
import ERC20ABI from "../config/abis/ERC20.json";
import Web3 from "web3";
import { ORDERBOOK_ADDRESS } from "../config/addresses";
import BigNumber from "bignumber.js";
export const formatEthAddress = (account: string) => {
  const address = account;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
const MAX_INT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const Home: NextPage = () => {
  const { account, activate, chainId, deactivate } = useWeb3React();
  const [nativeBalance, setNativeBalance] = useState(0);
  const [sendAddress, setSendAddress] = useState("");
  const [sendAmount, setSendAmount] = useState("0");
  const DEFAULT_TOKEN_LIST = tokenList.tokens;
  const [amountOut, setamountOut] = useState(0);
  const [amountIn, setamountIn] = useState(1);
  const [allowance, setallowance] = useState(0);
  const [fromToken, setfromToken] = useState({
    symbol: "USDT",
    logoURI: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png",
    address: "0xD55E530B14b05028c3dd650D4D0F69B81C49DeAA",
    decimals: 18,
  });
  const [toToken, settoToken] = useState({
    symbol: "ETH",
    logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    address: "0xD9Ff57cD5794dA453333264fA34d50F37b76cC30",
    decimals: 18,
  });
  const { web3 } = useWeb3();
  // @ts-ignore TYPE NEEDS FIXING
  const chainData = blockchains[chainId];
  const orderbookContract = new web3.eth.Contract(
    OrderBookDexABI,
    ORDERBOOK_ADDRESS
  );

  useEffect(() => {
    // @ts-ignore TYPE NEEDS FIXING
    if (window?.ethereum) {
      activate(injected);
    } else {
      alert("You need to install a crypto wallet to run this Dapp!!");
    }
  }, [activate]);
  const fetchAllowance = async () => {
    const fromTokenContract = new web3.eth.Contract(
      ERC20ABI,
      fromToken.address
    );

    const allowanceOp = await fromTokenContract.methods
      .allowance(account, ORDERBOOK_ADDRESS)
      .call();
    const formattedOp = new BigNumber(allowanceOp).toFixed(4);

    setallowance(formattedOp);
  };
  useEffect(() => {
    if (account) {
      fetchAllowance();
    }
  }, [fromToken, account]);
  useEffect(() => {
    const fromTokenSymbol = fromToken.symbol?.toLocaleLowerCase();
    const toTokenSymbol = toToken.symbol?.toLocaleLowerCase();

    const fetchAmountOut = async () => {
      const _amountIn = new BigNumber(amountIn)
        .multipliedBy(10 ** fromToken.decimals)
        .toNumber()
        .toLocaleString("fullwide", { useGrouping: false });
      const op = await orderbookContract.methods
        .queryAmountOut(fromTokenSymbol, toTokenSymbol, _amountIn)
        .call();
      console.log("====================================");
      console.log({ op });
      console.log("====================================");
      const formattedOp = new BigNumber(op)
        .div(10 ** toToken.decimals)
        .toFixed(5);

      setamountOut(formattedOp);
    };
    fetchAmountOut();
  }, [amountIn, fromToken, toToken]);
  const swap = async () => {
    try {
      const fromTokenSymbol = fromToken.symbol?.toLocaleLowerCase();
      const toTokenSymbol = toToken.symbol?.toLocaleLowerCase();
      const _amountIn = new BigNumber(amountIn)
        .multipliedBy(10 ** fromToken.decimals)
        .toNumber()
        .toLocaleString("fullwide", { useGrouping: false });
      const txn = await orderbookContract.methods
        .swap(fromTokenSymbol, toTokenSymbol, _amountIn)
        .send({
          from: account,
        });
      console.log("====================================");
      console.log({ txn });
      console.log("====================================");
      alert("Success");
    } catch (error) {
      alert("Failed");
      console.log("====================================");
      console.log({ error });
      console.log("====================================");
    }
  };
  const approve = async () => {
    const fromTokenContract = new web3.eth.Contract(
      ERC20ABI,
      fromToken.address
    );

    try {
      const txn = await fromTokenContract.methods
        .approve(ORDERBOOK_ADDRESS, MAX_INT)
        .send({
          from: account,
        });
      fetchAllowance();
      console.log("====================================");
      console.log({ txn });
      console.log("====================================");
      alert("Success");
    } catch (error) {
      alert("Failed");
      console.log("====================================");
      console.log({ error });
      console.log("====================================");
    }
  };
  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div></div>
      <main className="flex items-center justify-center h-screen">
        <div className="p-5 card bg-slate-100 w-96">
          <button
            className="my-5 btn btn-primary"
            onClick={() => activate(injected)}
          >
            {account ? formatEthAddress(account) : "Connect Wallet"}
          </button>
          <div className="my-5">
            <TokenSelectionModal
              tokenList={DEFAULT_TOKEN_LIST}
              selectedToken={fromToken}
              onSelect={setfromToken}
              secondToken={toToken}
            />
            <input
              type="number"
              min={0}
              placeholder="Type here"
              className="w-full max-w-xs input input-bordered input-info"
              defaultValue={amountIn}
              value={amountIn}
              onChange={(e) => setamountIn(e.target.value)}
            />
          </div>
          <div>
            <TokenSelectionModal
              tokenList={DEFAULT_TOKEN_LIST}
              selectedToken={toToken}
              onSelect={settoToken}
              secondToken={fromToken}
            />
            <input
              type="number"
              min={0}
              placeholder="Type here"
              className="w-full max-w-xs input input-bordered input-info outline outline-info"
              disabled
              value={amountOut}
            />
          </div>
          {allowance <= 0 && account && (
            <button className="my-5 btn btn-dark" onClick={approve}>
              Approve
            </button>
          )}
          {allowance > 0 && (
            <button className="my-5 btn btn-dark" onClick={swap}>
              Swap
            </button>
          )}
          {!account && (
            <button
              className="my-5 btn btn-primary"
              onClick={() => activate(injected)}
            >
              connect wallet
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
