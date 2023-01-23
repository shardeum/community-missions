import React, { useEffect } from "react";
import Header from "../components/Header";
import { genericMulticall } from "../utils/multicall";
import { useWeb3React } from "@web3-react/core";
import {
  NFT_CONTRACTS_LIST_BY_TYPE,
  NFT_CONTRACT_ADDRESS_T1,
} from "../config/addresses";
import ERC721 from "../config/abis/ERC721.json";
import BigNumber from "bignumber.js";

type Props = {};

function balances({}: Props) {
  //   const { account, activate, chainId, deactivate } = useWeb3React();

  // ISSUE : RPC BUSY ERRORS

  //   useEffect(() => {
  //     const fetchMulticallNftBalances = async () => {
  //       const balCalls = NFT_CONTRACTS_LIST_BY_TYPE.map((v, idx) => {
  //         return {
  //           address: v,
  //           name: "balanceOf",
  //           params: [account],
  //         };
  //       });
  //       const balances = await genericMulticall(ERC721, balCalls);
  //       console.log({ balances });
  //       const parsedBalances = balances?.map(([b], idx) => {
  //         return new BigNumber(b?._hex).toNumber();
  //       });
  //       console.log({ parsedBalances });

  //       if (parsedBalances[0]) {
  //         const tokensDataNft1Calls = new Array(parsedBalances[0])
  //           .fill(0)
  //           .map((v, idx) => {
  //             return {
  //               address: NFT_CONTRACT_ADDRESS_T1,
  //               name: "tokenOfOwnerByIndex",
  //               params: [account, idx],
  //             };
  //           });
  //         const balancesNft1 = await genericMulticall(
  //           ERC721,
  //           tokensDataNft1Calls
  //         );
  //         const tokenUriCalls = balancesNft1?.map(([v], idx) => {
  //           console.log({ params: [new BigNumber(v?._hex).toNumber()] });

  //           return {
  //             address: NFT_CONTRACT_ADDRESS_T1,
  //             name: "tokenURI",
  //             params: [new BigNumber(v?._hex).toNumber()],
  //           };
  //         });
  //         const tokenUriDetailsNft1 = await genericMulticall(
  //           ERC721,
  //           tokenUriCalls
  //         );
  //         console.log({ balancesNft1, tokenUriDetailsNft1 });
  //       }
  //     };
  //     if (account) {
  //       fetchMulticallNftBalances();
  //     }
  //   }, [account]);
  return (
    <>
      <Header />
    </>
  );
}

export default balances;
