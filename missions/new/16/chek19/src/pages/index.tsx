import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import {
  useContract,
  useContractRead,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import config from "../contractconfig.json";
import { useConnect, useAccount } from "wagmi";
import { useIsMounted } from "../hooks/useIsMounted";
import { CreateImage } from "../components/createImage";
import { Totalwallets } from "@/components/totalwallet";
import { Userwallets } from "@/components/userwallet";
import { Contractdeploy } from "@/components/contractdeploy";
export default function Home() {
  const address1 = "0x5C99E8678657110cA3adD8EfD908C7964d67e634";
  const { address, isConnecting, isDisconnected } = useAccount();
  const mounted = useIsMounted();
  const [data1, setData] = useState(null);
  const { connector: activeConnector, isConnected } = useAccount();
  const { data, isError, isLoading } = useContractRead({
    address: address1,
    abi: config.abi2,
    functionName: "totalWallets",
    watch: true,
  });
  const { data: data2 } = useContractRead({
    address: address1,
    abi: config.abi2,
    functionName: "userWallets",
    args: [address],
    watch: true,
  });

  // const { config: turnright } = usePrepareContractWrite({
  //   address: address1,
  //   abi: config.abi,
  //   functionName: "solveSudoku",
  // });
  // const { write: turnr } = useContractWrite(turnright);
  // const onturn = async () => {
  //   try {
  //     await turnr?.();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  console.log(data2);
  return (
    <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 h-screen w-screen">
      <div className="flex justify-end">
        <ConnectButton showBalance={false} />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold  text-white-800">
          MultiSig Wallet Factory
        </h1>
      </div>
      {mounted && isConnected ? (
        <div className="flex justify-between ">
          <div className="flex flex-col items-center border border-gray-400">
            {data && data2 ? <Totalwallets wallets={data} /> : <h1>""</h1>}
          </div>
          <div className="flex flex-col gap-4">
            {data && data2 ? <Userwallets wallets={data2} /> : <h1>""</h1>}
          </div>
          <div>
            <Contractdeploy wallets={data} />
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
