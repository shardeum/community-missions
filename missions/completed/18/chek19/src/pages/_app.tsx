import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import Script from "next/script";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { Chain } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const shardeum: Chain = {
  id: 8082,
  name: "Shardeum sphinx",
  network: "shardeum",
  nativeCurrency: {
    decimals: 18,
    name: "Shardeum",
    symbol: "SHM",
  },
  rpcUrls: {
    default: {
      http: ["https://sphinx.shardeum.org/"],
    },
    public: { http: [""] },
  },
  blockExplorers: {
    default: {
      name: "SnowTrace",
      url: "https://explorer-sphinx.shardeum.org/",
    },
    etherscan: {
      name: "SnowTrace",
      url: "https://explorer-sphinx.shardeum.org/",
    },
  },
  testnet: true,
};
const shardeum1: Chain = {
  id: 8081,
  name: "Shardeum Liberty",
  network: "shardeum liberty",
  nativeCurrency: {
    decimals: 18,
    name: "Shardeum",
    symbol: "SHM",
  },
  rpcUrls: {
    default: {
      http: ["https://liberty20.shardeum.org/"],
    },
    public: { http: [""] },
  },
  blockExplorers: {
    default: {
      name: "SnowTrace",
      url: "https://explorer-sphinx.shardeum.org/",
    },
    etherscan: {
      name: "SnowTrace",
      url: "https://explorer-sphinx.shardeum.org/",
    },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [shardeum, shardeum1],
  [
    jsonRpcProvider({
      rpc: (chain) => ({ http: chain.rpcUrls.default.http[0] }),
    }),
  ]
);
const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <script src="/snarkjs.min.js" />
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
