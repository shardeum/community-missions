import React from "react";
import ReactDOM from "react-dom/client";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import App from "./App";
import "./index.css";

const { chains, webSocketProvider, provider } = configureChains(
  [polygonMumbai],
  [
    publicProvider(),
    alchemyProvider({ apiKey: process.env.ALCHEMY_KEY as string }),
  ]
);

const client = createClient({ autoConnect: true, provider, webSocketProvider });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);
