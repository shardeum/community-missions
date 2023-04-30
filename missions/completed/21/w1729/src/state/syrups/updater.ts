import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useActiveWeb3React } from 'hooks';
import { useFetchSyrupListCallback } from 'hooks/useFetchSyrupListCallback';
import useInterval from 'hooks/useInterval';
import useIsWindowVisible from 'hooks/useIsWindowVisible';
import { AppDispatch, AppState } from 'state';
import { acceptSyrupUpdate } from './actions';

export default function Updater(): null {
  const { library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const syrups = useSelector<AppState, AppState['syrups']['byUrl']>(
    (state) => state.syrups.byUrl,
  );

  const isWindowVisible = useIsWindowVisible();

  const fetchSyrupList = useFetchSyrupListCallback();
  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return;
    Object.keys(syrups).forEach((url) =>
      fetchSyrupList(url).catch((error) =>
        console.debug('interval list fetching error', error),
      ),
    );
  }, [fetchSyrupList, isWindowVisible, syrups]);

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null);

  // whenever a list is not loaded and not loading, try again to load it
  useEffect(() => {
    Object.keys(syrups).forEach((listUrl) => {
      const syrup = syrups[listUrl];

      if (!syrup.current && !syrup.loadingRequestId && !syrup.error) {
        fetchSyrupList(listUrl).catch((error) =>
          console.debug('list added fetching error', error),
        );
      }
    });
  }, [dispatch, fetchSyrupList, library, syrups]);

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(syrups).forEach((listUrl) => {
      const syrup = syrups[listUrl];
      if (syrup.current && syrup.pendingUpdate) {
        //Auto update syrups until we create the versioning infrastructure that the tokens list has
        dispatch(acceptSyrupUpdate(listUrl));
      }
    });
  }, [dispatch, syrups]);

  return null;
}
