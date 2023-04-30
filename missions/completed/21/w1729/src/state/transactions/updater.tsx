import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { useBlockNumber } from 'state/application/hooks';
import { useAddPopup, useRemovePopup } from 'state/application/hooks';
import { AppDispatch, AppState } from 'state';
import { checkedTransaction, finalizeTransaction } from './actions';
import { updateBlockNumber } from 'state/application/actions';

export function shouldCheck(
  lastBlockNumber: number,
  tx: { addedTime: number; receipt?: any; lastCheckedBlockNumber?: number },
): boolean {
  if (tx.receipt) return false;
  if (!tx.lastCheckedBlockNumber) return true;
  const blocksSinceCheck = lastBlockNumber - tx.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) return false;
  const minutesPending = (new Date().getTime() - tx.addedTime) / 1000 / 60;
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}

export default function Updater(): null {
  const { chainId, library } = useActiveWeb3React();
  const [popupTxHashes, setPopupTxHashes] = useState(''); // to store hash of the transactions already opened a popup.

  const lastBlockNumber = useBlockNumber();

  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector<AppState, AppState['transactions']>(
    (state) => state.transactions,
  );

  const transactions = useMemo(() => (chainId ? state[chainId] ?? {} : {}), [
    chainId,
    state,
  ]);

  // show popup on confirm
  const addPopup = useAddPopup();
  const removePopup = useRemovePopup();

  useEffect(() => {
    if (!chainId || !library || !lastBlockNumber) return;

    Object.keys(transactions)
      .filter((hash) => shouldCheck(lastBlockNumber, transactions[hash]))
      .forEach((hash) => {
        library.getTransaction(hash).then((res) => {
          // to prevent opening the processing popup multiple times when the transaction is pending for a long time.
          if (popupTxHashes.indexOf(hash) === -1 && res) {
            addPopup(
              {
                txn: {
                  hash,
                  pending: true,
                  success: false,
                  summary: transactions[hash]?.summary,
                },
              },
              hash,
              null,
            );

            setTimeout(() => {
              removePopup(hash);
            }, 20000);

            let hashStr = popupTxHashes;
            hashStr += hash + ',';
            setPopupTxHashes(hashStr);
          }
          if (!res) {
            dispatch(
              finalizeTransaction({
                chainId,
                hash,
                receipt: 'failed',
              }),
            );
          }
        });

        library
          .getTransactionReceipt(hash)
          .then((receipt) => {
            if (receipt) {
              // the receipt was fetched before the block, fast forward to that block to trigger balance updates
              if (receipt.blockNumber > lastBlockNumber) {
                dispatch(
                  updateBlockNumber({
                    chainId,
                    blockNumber: receipt.blockNumber,
                  }),
                );
              }

              dispatch(
                finalizeTransaction({
                  chainId,
                  hash,
                  receipt: {
                    blockHash: receipt.blockHash,
                    blockNumber: receipt.blockNumber,
                    contractAddress: receipt.contractAddress,
                    from: receipt.from,
                    status: receipt.status,
                    to: receipt.to,
                    transactionHash: receipt.transactionHash,
                    transactionIndex: receipt.transactionIndex,
                  },
                }),
              );

              removePopup(hash);

              addPopup(
                {
                  txn: {
                    hash,
                    success: receipt.status === 1,
                    summary: transactions[hash]?.summary,
                  },
                },
                hash,
              );
            } else {
              dispatch(
                checkedTransaction({
                  chainId,
                  hash,
                  blockNumber: lastBlockNumber,
                }),
              );
            }
          })
          .catch((error) => {
            console.error(`failed to check transaction hash: ${hash}`, error);
          });
      });
  }, [
    chainId,
    library,
    transactions,
    removePopup,
    lastBlockNumber,
    dispatch,
    addPopup,
    popupTxHashes,
  ]);

  return null;
}
