import { Web3Provider } from '@ethersproject/providers';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { LedgerConnector } from '@web3-react/ledger-connector';
import { WalletLinkConnector } from './WalletLink';
import { PortisConnector } from './Portis';

import { FortmaticConnector } from './Fortmatic';
import { ArkaneConnector } from './Arkane';
import { NetworkConnector } from './NetworkConnector';
import { SafeAppConnector } from './SafeApp';

const POLLING_INTERVAL = 12000;

const NETWORK_URL = 'https://sepolia.infura.io/v3/';
// const FORMATIC_KEY = 'pk_live_F937DF033A1666BF'
// const PORTIS_ID = 'c0e2bf01-4b08-4fd5-ac7b-8e26b58cd236'
const FORMATIC_KEY = process.env.REACT_APP_FORTMATIC_KEY;
const PORTIS_ID = process.env.REACT_APP_PORTIS_ID;

export const NETWORK_CHAIN_ID: number = parseInt(
  process.env.REACT_APP_CHAIN_ID ?? '1',
);

if (typeof NETWORK_URL === 'undefined') {
  throw new Error(
    `REACT_APP_NETWORK_URL must be a defined environment variable`,
  );
}

export const network = new NetworkConnector({
  urls: { [Number('11155111')]: NETWORK_URL },
});

let networkLibrary: Web3Provider | undefined;
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary =
    networkLibrary ?? new Web3Provider(network.provider as any));
}

export const injected = new InjectedConnector({
  supportedChainIds: [11155111],
});

export const safeApp = new SafeAppConnector();

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: { 137: NETWORK_URL },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
});

// mainnet only
export const arkaneconnect = new ArkaneConnector({
  clientID: 'QuickSwap',
  chainId: 137,
});

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: FORMATIC_KEY ?? '',
  chainId: 137,
});

// mainnet only
export const portis = new PortisConnector({
  dAppId: PORTIS_ID ?? '',
  networks: [137],
  config: {
    nodeUrl: NETWORK_URL,
    chainId: 137,
  },
});

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: NETWORK_URL,
  appName: 'Uniswap',
  appLogoUrl:
    'https://mpng.pngfly.com/20181202/bex/kisspng-emoji-domain-unicorn-pin-badges-sticker-unicorn-tumblr-emoji-unicorn-iphoneemoji-5c046729264a77.5671679315437924251569.jpg',
  supportedChainIds: [137],
});

export const ledger = new LedgerConnector({
  chainId: 137,
  url: NETWORK_URL,
  pollingInterval: POLLING_INTERVAL,
});
