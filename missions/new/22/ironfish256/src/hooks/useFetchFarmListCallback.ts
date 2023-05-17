import { nanoid } from '@reduxjs/toolkit';
import { ChainId } from '@uniswap/sdk';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkLibrary, NETWORK_CHAIN_ID } from '../connectors';
import { AppDispatch } from 'state';
import resolveENSContentHash from 'utils/resolveENSContentHash';
import { useActiveWeb3React } from 'hooks';
import { fetchFarmList } from 'state/farms/actions';
import getFarmList from 'utils/getFarmList';
import { FarmListInfo } from 'types';

export function useFetchFarmListCallback(): (
  listUrl: string,
) => Promise<FarmListInfo> {
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
      dispatch(fetchFarmList.pending({ requestId, url: listUrl }));
      return getFarmList(listUrl, ensResolver)
        .then((farmList) => {
          dispatch(
            fetchFarmList.fulfilled({ url: listUrl, farmList, requestId }),
          );
          return farmList;
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error);
          dispatch(
            fetchFarmList.rejected({
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
