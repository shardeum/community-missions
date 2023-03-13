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
  const address1 = "0xf34b6ec7cCbFb4fa4A3bf97d1806b6962f994499";
  const { address, isConnecting, isDisconnected } = useAccount();
  const mounted = useIsMounted();
  const [data1, setData] = useState(null);
  const { connector: activeConnector, isConnected } = useAccount();
  const { data, isError, isLoading } = useContractRead({
    address: address1,
    abi: config.abi,
    functionName: "userImages",
    args: [address],
    watch: true,
  });
  const { data: data2 } = useContractRead({
    address: address1,
    abi: config.abi,
    functionName: "currentImage",
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
    functionName: "turnRight",
  });
  const { write: turnr } = useContractWrite(turnright);
  const onturn = async () => {
    try {
      await turnr?.();
    } catch (error) {
      console.log(error);
    }
  };
  const { config: turnleft } = usePrepareContractWrite({
    address: address1,
    abi: config.abi,
    functionName: "turnLeft",
  });
  const { write: turnl } = useContractWrite(turnleft);
  const onturnl = async () => {
    try {
      await turnl?.();
    } catch (error) {
      console.log(error);
    }
  };
  const { config: turnvertical } = usePrepareContractWrite({
    address: address1,
    abi: config.abi,
    functionName: "flipVertically",
  });
  const { write: turnv } = useContractWrite(turnvertical);
  const onturnv = async () => {
    try {
      await turnv?.();
    } catch (error) {
      console.log(error);
    }
  };
  const { config: turnhorizontal } = usePrepareContractWrite({
    address: address1,
    abi: config.abi,
    functionName: "flipHorizontally",
  });
  const { write: turnh } = useContractWrite(turnhorizontal);
  const onturnh = async () => {
    try {
      await turnh?.();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <div className="flex justify-end">
        <ConnectButton showBalance={false} />
      </div>
      {mounted && isConnected ? (
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <button
              onClick={onturn}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block mb-2"
            >
              Turn Right
            </button>
            <button
              onClick={onturnl}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded block mb-2"
            >
              Turn Left
            </button>
            <button
              onClick={onturnv}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded block mb-2"
            >
              Flip Vertically
            </button>
            <button
              onClick={onturnh}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded block"
            >
              Flip Horizontally
            </button>
          </div>
          <CreateImage data={data2} />
          <div className="flex flex-col gap-4">
            <div className="bg-gray-100 p-4">
              Turn Right:{data ? data["rightTurns"].toString() : 0}
            </div>
            <div className="bg-gray-200 p-4">
              Turn Left:{data ? data["leftTurns"].toString() : 0}
            </div>
            <div className="bg-gray-300 p-4">
              Flip Vertically:{data ? data["verticalFlips"].toString() : 0}
            </div>
            <div className="bg-gray-400 p-4">
              Flip Horizontal:{data ? data["horizontalFlips"].toString() : 0}
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
