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
export default function Home() {
  const address1 = "0x0660F89d0f583bc5aA0960Ff01ee9303A69B7Ca0";
  const { address, isConnecting, isDisconnected } = useAccount();
  const mounted = useIsMounted();
  const [data1, setData] = useState(null);
  const { connector: activeConnector, isConnected } = useAccount();
  const { data, isError, isLoading } = useContractRead({
    address: address1,
    abi: config.abi,
    functionName: "board",
    args: [address],
    watch: true,
  });
  const { data: data2 } = useContractRead({
    address: address1,
    abi: config.abi,
    functionName: "didThePlayerWin",
    args: [address],
    watch: true,
  });
  useEffect(() => {
    const intervalId = setInterval(() => {
      // fetch data here
    }, 5000); // check data every 5 seconds

    return () => clearInterval(intervalId); // clear interval on unmount
  }, []);
  const { config: turnright } = usePrepareContractWrite({
    address: address1,
    abi: config.abi,
    functionName: "solveSudoku",
  });
  const { write: turnr } = useContractWrite(turnright);
  const onturn = async () => {
    try {
      await turnr?.();
    } catch (error) {
      console.log(error);
    }
  };
  console.log(data2);
  return (
    <div>
      <div className="flex justify-end">
        <ConnectButton showBalance={false} />
      </div>
      {mounted && isConnected ? (
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center">
            <button
              onClick={onturn}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block mb-2"
            >
              computeBruteForceWin
            </button>
          </div>
          <CreateImage data={data} />
          <div className="flex flex-col gap-4">
            <div className="bg-gray-100 p-4">
              didThePlayerWin: {data2 ? data2.toString() : ""}
            </div>
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
