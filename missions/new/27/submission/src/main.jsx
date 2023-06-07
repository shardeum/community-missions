import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import logo from "./assets/solidityVault.png";
import { WagmiConfig, createConfig } from "wagmi";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultConfig,
} from "connectkit";
import { shardeumSphinx } from "viem/chains";
const config = createConfig(
  getDefaultConfig({
    // Required API Keys
    alchemyId: "iSoLFoQDND_y0a4IOLotRoJ-ZPy2r5it", // or infuraId
    walletConnectProjectId: "290fe969658b17415aa3fc92fd257e30",
    chains: [shardeumSphinx],
    // Required
    appName: "Solidity Vault",
    // Optional
    appDescription:
      "Create a bank contract in Solidity which locks your tokens and mints ERC-20 tokens over time.",
    appLogo: logo, // your app's logo,no bigger than 1024x1024px (max. 1MB)
  })
);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <App />
      </ConnectKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
