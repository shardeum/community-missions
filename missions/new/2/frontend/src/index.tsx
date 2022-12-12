import React from "react";
import ReactDOM from "react-dom/client";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import App from "./App";
import "./index.css";

const { webSocketProvider, provider } = configureChains(
  [polygonMumbai],
  [
    publicProvider(),
    alchemyProvider({ apiKey: "X88iYqERud7ygMVdrdULnMkr5rfbxH6Q" }),
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
