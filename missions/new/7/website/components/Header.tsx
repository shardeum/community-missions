import { useWeb3React } from "@web3-react/core";
import React, { Component } from "react";
import { formatEthAddress } from "../utils";
import { injected } from "../config/wallets";
import Link from "next/link";

type Props = {};

type State = {};

const Header = () => {
  const { account, activate, chainId, deactivate } = useWeb3React();

  return (
    <div className="flex items-center justify-between w-full px-10 bg-gray-100/5">
      <Link href="/" className="text-xl">
        NFT Pixel Art
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/balances">Balances</Link>
        <button
          className="my-5 btn btn-primary"
          onClick={() => activate(injected)}
        >
          {account ? formatEthAddress(account) : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
};

export default Header;
