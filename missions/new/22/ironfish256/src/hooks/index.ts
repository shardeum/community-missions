import { useEffect, useState, useCallback } from 'react';
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { ChainId } from '@uniswap/sdk';
import { isMobile } from 'react-device-detect';
import { injected, safeApp } from 'connectors';
import { GlobalConst } from 'constants/index';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'state';
/* eslint-disable */
// @ts-ignore
import transakSDK from '@transak/transak-sdk';
import { addPopup } from 'state/application/actions';
import { useSingleCallResult, NEVER_RELOAD } from 'state/multicall/hooks';
import { useArgentWalletDetectorContract } from './useContract';

export function useActiveWeb3React(): Web3ReactContextInterface<
  Web3Provider
> & {
  chainId?: ChainId;
} {
  const context = useWeb3ReactCore<Web3Provider>();
  const contextNetwork = useWeb3ReactCore<Web3Provider>(
    GlobalConst.utils.NetworkContextName,
  );
  return context.active ? context : contextNetwork;
}

export function useIsArgentWallet(): boolean {
  const { account } = useActiveWeb3React();
  const argentWalletDetector = useArgentWalletDetectorContract();
  const call = useSingleCallResult(
    argentWalletDetector,
    'isArgentWallet',
    [account ?? undefined],
    NEVER_RELOAD,
  );
  return call?.result?.[0] ?? false;
}

export function useInitTransak() {
  const dispatch = useDispatch<AppDispatch>();
  const initTransak = (account: any, mobileWindowSize: boolean) => {
    const transak = new transakSDK({
      apiKey: process.env.REACT_APP_TRANSAK_KEY, // Your API Key
      environment: 'PRODUCTION', // STAGING/PRODUCTION
      defaultCryptoCurrency: 'MATIC',
      walletAddress: account, // Your customer's wallet address
      themeColor: '2891f9', // App theme color
      redirectURL: 'window.location.origin',
      hostURL: window.location.origin,
      widgetHeight: mobileWindowSize ? '450px' : '600px',
      widgetWidth: mobileWindowSize ? '360px' : '450px',
      networks: 'matic',
    });

    transak.init();

    // To get all the events
    transak.on(transak.TRANSAK_ORDER_FAILED, (data: any) => {
      dispatch(
        addPopup({
          key: 'abc',
          content: {
            txn: { hash: '', summary: 'Buy order failed', success: false },
          },
        }),
      );
      console.log(data);
    });

    // This will trigger when the user marks payment is made.
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
      dispatch(
        addPopup({
          key: 'abc',
          content: {
            txn: {
              hash: '',
              summary:
                'Buy ' +
                orderData.status.cryptoAmount +
                ' ' +
                orderData.status.cryptocurrency +
                ' for ' +
                orderData.status.fiatAmount +
                ' ' +
                orderData.status.fiatCurrency,
              success: true,
            },
          },
        }),
      );
      console.log(orderData);
      transak.close();
    });
  };

  return { initTransak };
}

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore(); // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false);

  const checkInjected = useCallback(() => {
    return injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true);
          });
        } else {
          setTried(true);
        }
      }
    });
  }, [activate]);

  useEffect(() => {
    Promise.race([
      safeApp.getSafeInfo(),
      new Promise((resolve) => setTimeout(resolve, 100)),
    ]).then(
      (safe) => {
        if (safe) activate(safeApp, undefined, true);
        else checkInjected();
      },
      () => {
        checkInjected();
      },
    );
  }, [activate, checkInjected]); // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true);
    }
  }, [active]);

  return tried;
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore(); // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { ethereum } = window;

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error);
        });
      };

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error);
          });
        }
      };

      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
    return undefined;
  }, [active, error, suppress, activate]);
}
