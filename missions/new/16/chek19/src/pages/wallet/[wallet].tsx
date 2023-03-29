import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Button from "@mui/material/Button";
import {
  useContract,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import config from "../../contractconfig.json";
import { useConnect, useAccount } from "wagmi";
import { useIsMounted } from "../../hooks/useIsMounted";
import { Walletdata } from "@/components/walletdata";
import Link from "next/link";
function Wallet() {
  const router = useRouter();
  const { address, isConnecting, isDisconnected } = useAccount();
  const mounted = useIsMounted();
  const [data1, setData] = useState(null);
  const { connector: activeConnector, isConnected } = useAccount();
  return (
    // <div>
    //   <p>Your wallet address is: {router.query.wallet}</p>
    // </div>
    <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 h-screen w-screen">
      <div className="flex justify-end">
        <ConnectButton showBalance={false} />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold  text-white-800">MultiSig Wallet</h1>
        <Link href="/">
          <Button variant="contained">Home</Button>
        </Link>
      </div>
      {mounted && isConnected ? (
        <div className="flex  h-screen">
          <div className="flex flex-col gap-4">
            <Walletdata wallet={router.query.wallet} />
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
            <p className="text-gray-600">
              Please connect your wallet to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet;
