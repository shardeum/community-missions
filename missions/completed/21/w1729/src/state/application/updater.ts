import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import useDebounce from 'hooks/useDebounce';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { updateBlockNumber } from './actions';
import { useEthPrice } from './hooks';
import { getEthPrice } from 'utils';

export default function Updater(): null {
  const { library, chainId } = useActiveWeb3React();
  const { ethereum } = window as any;
  const dispatch = useDispatch();
  const { ethPrice, updateEthPrice } = useEthPrice();

  const windowVisible = useIsWindowVisible();

  const [state, setState] = useState<{
    chainId: number | undefined;
    blockNumber: number | null;
  }>({
    chainId,
    blockNumber: null,
  });

  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  const blockNumberCallback = useCallback(
    (blockNumber: number) => {
      setState((state) => {
        if (chainId === state.chainId) {
          if (typeof state.blockNumber !== 'number')
            return { chainId, blockNumber };
          return {
            chainId,
            blockNumber,
          };
        }
        return state;
      });
    },
    [chainId, setState],
  );

  // this is for refreshing eth price every 10 mins
  useEffect(() => {
    const interval = setInterval(() => {
      const _currentTime = Math.floor(Date.now() / 1000);
      setCurrentTime(_currentTime);
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      const [price, oneDayPrice, ethPriceChange] = await getEthPrice();
      updateEthPrice({ price, oneDayPrice, ethPriceChange });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  // attach/detach listeners
  useEffect(() => {
    if (!library || !chainId || !windowVisible) return undefined;

    setState({ chainId, blockNumber: null });

    library
      .getBlockNumber()
      .then(blockNumberCallback)
      .catch((error) =>
        console.error(
          `Failed to get block number for chainId: ${chainId}`,
          error,
        ),
      );

    library.on('block', blockNumberCallback);

    ethereum?.on('chainChanged', () => {
      document.location.reload();
    });

    return () => {
      library.removeListener('block', blockNumberCallback);
    };
  }, [
    dispatch,
    chainId,
    library,
    blockNumberCallback,
    windowVisible,
    ethereum,
  ]);

  const debouncedState = useDebounce(state, 100);

  useEffect(() => {
    if (
      !debouncedState.chainId ||
      !debouncedState.blockNumber ||
      !windowVisible
    )
      return;
    dispatch(
      updateBlockNumber({
        chainId: debouncedState.chainId,
        blockNumber: debouncedState.blockNumber,
      }),
    );
  }, [
    windowVisible,
    dispatch,
    debouncedState.blockNumber,
    debouncedState.chainId,
  ]);

  return null;
}
