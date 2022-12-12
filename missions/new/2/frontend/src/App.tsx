import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import abi from "./assets/contractAbi.json";
import "./App.css";
import { BigNumber } from "ethers";

const CONTRACT_ADDRESS = "0x18fA0d74b47C9C4b3896Ac1000e3c21c454bbdEA";

interface TData {
  marblesOnTable: BigNumber;
  computerWins: BigNumber;
  playerWins: BigNumber;
}

function App() {
  const [isNewGame, setIsNewGame] = useState(false);
  const [marbles, setMarbles] = useState<number>();
  const [marblesOnTable, setMarblesOnTable] = useState<number>();
  const { address } = useAccount();
  const [currentTx, setCurrentTx] = useState<`0x${string}`>();
  const { connect } = useConnect({ connector: new InjectedConnector() });

  const { data, isError, error, refetch, isSuccess } = useContractRead<
    any,
    any,
    TData
  >({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getUserStats",
    overrides: { from: address },
  });

  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "newGame",
  });
  const { write, isLoading: gameLoading } = useContractWrite({
    ...config,
    onSuccess(data, variables, context) {
      if (data?.hash) {
        setCurrentTx(data.hash);
      }
    },
  });

  const { config: turnConfig } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "turn",
    args: [marbles],
  });
  const {
    isLoading: turnLoading,
    write: writeTurn,
    error: turnError,
  } = useContractWrite({
    ...turnConfig,
    onSuccess(data, variables, context) {
      if (data?.hash) {
        setCurrentTx(data.hash);
      }
    },
  });

  const { data: txData, isLoading: txLoading } = useWaitForTransaction({
    hash: currentTx || undefined,
    confirmations: 1,
    enabled: !!currentTx,
  });
  useEffect(() => {
    if (isError) {
      alert(error);
      return;
    }

    if (!data) {
      console.log(error, data);
      return;
    }

    const marblesOnTable = data["marblesOnTable"].toNumber();
    console.log(data, "player stats");
    setMarblesOnTable(marblesOnTable);
    if (marblesOnTable === 0) {
      setIsNewGame(false);
    } else {
      setIsNewGame(true);
    }
  }, [data, isError, isSuccess, error]);

  useEffect(() => {
    if (txData) {
      if (!isNewGame) {
        setIsNewGame(true);
      }
      refetch();
    }
  }, [txData, isNewGame, refetch]);

  useEffect(() => {
    if (!turnError) return;
    console.log(turnError);
    alert("TX faileD");
  }, [turnError]);

  const startANewGame = () => {
    write?.();
  };

  const onTurn = () => {
    if (!marbles) {
      alert("Please enter marbles count");
      return;
    }
    if (marbles > 3) {
      alert("Sorry max allowed is 3!");
      return;
    }

    if (marblesOnTable !== 12 && marbles === 0) {
      alert("You need to choose atleast 1 marble now");
      return;
    }

    writeTurn?.();
    refetch();
  };

  return (
    <div className="App">
      <h1>Solidity Nim</h1>
      {!address && (
        <div className="card">
          <button onClick={() => connect()}>Connect Wallet</button>
        </div>
      )}
      {!isNewGame && address && (
        <div className="card">
          <button disabled={gameLoading} onClick={startANewGame}>
            {txLoading ? "Starting..." : "Start a new Game"}
          </button>
        </div>
      )}
      {isNewGame && address && (
        <div>
          <input
            className="input"
            placeholder="Enter count of marbles"
            value={marbles}
            onChange={(e) => setMarbles(parseInt(e.target.value) || 0)}
          />
          <div className="card">
            <button onClick={onTurn} disabled={turnLoading}>
              {txLoading ? "Playing..." : "Turn"}
            </button>
          </div>
        </div>
      )}
      {data && (
        <div>
          <p>Current Marbles: {marblesOnTable}</p>
          <p>Computer Wins: {data["computerWins"]?.toNumber()}</p>
          <p>Your Wins: {data["playerWins"]?.toNumber()}</p>
        </div>
      )}
    </div>
  );
}

export default App;
