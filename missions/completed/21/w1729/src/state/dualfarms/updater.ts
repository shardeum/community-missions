import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { useFetchDualFarmListCallback } from 'hooks/useFetchDualFarmListCallback';
import useInterval from 'hooks/useInterval';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { AppDispatch, AppState } from 'state';
import { acceptDualFarmUpdate } from './actions';

export default function Updater(): null {
  const { library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const dualFarms = useSelector<AppState, AppState['dualFarms']['byUrl']>(
    (state) => state.dualFarms.byUrl,
  );

  const isWindowVisible = useIsWindowVisible();

  const fetchDualFarmList = useFetchDualFarmListCallback();
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return;
    Object.keys(dualFarms).forEach((url) =>
      fetchDualFarmList(url).catch((error) =>
        console.debug('interval list fetching error', error),
      ),
    );
  }, [fetchDualFarmList, isWindowVisible, dualFarms]);

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null);

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(dualFarms).forEach((listUrl) => {
      const farm = dualFarms[listUrl];

      if (!farm.current && !farm.loadingRequestId && !farm.error) {
        fetchDualFarmList(listUrl).catch((error) =>
          console.debug('list added fetching error', error),
        );
      }
    });
  }, [dispatch, fetchDualFarmList, library, dualFarms]);

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(dualFarms).forEach((listUrl) => {
      const farm = dualFarms[listUrl];
      if (farm.current && farm.pendingUpdate) {
        //Auto update farms until we create the versioning infrastructure that the tokens list has
        dispatch(acceptDualFarmUpdate(listUrl));
      }
    });
  }, [dispatch, dualFarms]);

  return null;
}
