import { nanoid } from '@reduxjs/toolkit';
import { ChainId } from '@uniswap/sdk';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkLibrary, NETWORK_CHAIN_ID } from '../connectors';
import { AppDispatch } from 'state';
import resolveENSContentHash from 'utils/resolveENSContentHash';
import { useActiveWeb3React } from 'hooks';
import { fetchDualFarmList } from 'state/dualfarms/actions';
import getDualFarmList from 'utils/getDualFarmList';
import { DualFarmListInfo } from 'types';

export function useFetchDualFarmListCallback(): (
  listUrl: string,
) => Promise<DualFarmListInfo> {
  const { library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();

  //TODO: support multi chain
  const ensResolver = useCallback(
    (ensName: string) => {
      if (!library) {
        throw new Error('Could not construct mainnet ENS resolver');
      }
      return resolveENSContentHash(ensName, library);
    },
    [library],
  );

  return useCallback(
    async (listUrl: string) => {
      const requestId = nanoid();
      dispatch(fetchDualFarmList.pending({ requestId, url: listUrl }));
      return getDualFarmList(listUrl, ensResolver)
        .then((dualFarmList) => {
          dispatch(
            fetchDualFarmList.fulfilled({
              url: listUrl,
              dualFarmList,
              requestId,
            }),
          );
          return dualFarmList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          dispatch(
            fetchDualFarmList.rejected({
              url: listUrl,
              requestId,
              errorMessage: error.message,
            }),
          );
          throw error;
        });
    },
    [dispatch, ensResolver],
  );
}
