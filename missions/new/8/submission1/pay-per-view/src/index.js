import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { goerli, chain } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const sharderumChain = {
  id: 8081,
  name: 'Shardeum Liberty 2.X',
  network: 'shardeum',
  iconUrl: 'https://example.com/icon.svg',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Sharderum',
    symbol: 'SHM',
  },
  rpcUrls: {
    default: {
      http: ['https://liberty20.shardeum.org/'],
    },
  },
  blockExplorers: {
    default: { name: 'SharderumExplorer', url: 'https://explorer-liberty20.shardeum.org/' },
    etherscan: { name: 'SharderumExplorer', url: 'https://explorer-liberty20.shardeum.org/' },
  },
  testnet: false,
};

const { chains, provider } = configureChains(
  [sharderumChain],
  [
    jsonRpcProvider({
      rpc: chain => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'test',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <StrictMode>
    <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider 
      chains={chains} 
      coolMode
/*       theme={darkTheme({
        accentColor: '#161718',
        fontStack: 'system',
        overlayBlur: 'small',
        borderRadius: "large"
      })} */
  >
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
