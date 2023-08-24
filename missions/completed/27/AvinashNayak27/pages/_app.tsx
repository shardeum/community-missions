import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createClient, WagmiConfig } from 'wagmi';

import { Chain } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const ShardeumBetanet: Chain = {
  id: 8081,
  name: 'Shardeum Betanet',
  network: 'shardeum',
  nativeCurrency: {
    decimals: 18,
    name: 'Shardeum',
    symbol: 'SHM',
  },
  rpcUrls: {
    default: {
      http: ['https://dapps.shardeum.org/'],
    },
    public: {
      http: ['https://dapps.shardeum.org/'],
    },
  },
  blockExplorers: {
    default: { name: 'SHM Explorer', url: 'https://explorer-dapps.shardeum.org/' },
    etherscan: { name: 'SHM Explorer', url: 'https://explorer-dapps.shardeum.org/' },
  },
  testnet: true,
};


const { provider, chains } = configureChains(
  [ShardeumBetanet],
  [
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);


const { connectors } = getDefaultWallets({
  appName: 'RainbowKit App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;