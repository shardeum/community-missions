import 'styles/style.scss'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { app } from 'appConfig'
import { useState, useEffect } from 'react'
import HeadGlobal from 'components/HeadGlobal'
// Web3Wrapper deps:
import { connectorsForWallets, RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  metaMaskWallet,
  braveWallet,
  coinbaseWallet,
  walletConnectWallet,
  ledgerWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { Chain } from '@rainbow-me/rainbowkit'
import { createClient, configureChains, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <HeadGlobal />
      <Web3Wrapper>
        <Component key={router.asPath} {...pageProps} />
      </Web3Wrapper>
    </ThemeProvider>
  )
}
export default App

// Add Custom Chain
// Demo purpose, gnosis is included in wagmi/chains
// import { gnosis } from 'wagmi/chains'
const shardeumChain: Chain = {
  id: 8081,
  name: 'Shardeum',
  network: 'shardeum',
  iconUrl: 'https://icodrops.com/wp-content/uploads/2022/10/H88Y46ND_400x400.jpg',
  iconBackground: '#000',
  nativeCurrency: {
    decimals: 18,
    name: 'Shardeum',
    symbol: 'SHM',
  },
  rpcUrls: {
    default: {
      http: ['https://dapps.shardeum.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shardeum Chain Explorer',
      url: 'https://explorer-dapps.shardeum.org',
    },
  },
  testnet: true,
}

// Web3 Configs
const { chains, provider } = configureChains(
  [shardeumChain],
  [
    jsonRpcProvider({
      rpc: chain => {
        if (chain.id !== shardeumChain.id) return null
        return {
          http: `${chain.rpcUrls.default}`,
        }
      },
    }),
    publicProvider(),
  ]
)

const otherWallets = [
  braveWallet({ chains }),
  ledgerWallet({ chains }),
  coinbaseWallet({ chains, appName: app.name }),
  rainbowWallet({ chains }),
]

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [injectedWallet({ chains }), metaMaskWallet({ chains }), walletConnectWallet({ chains })],
  },
  {
    groupName: 'Other Wallets',
    wallets: otherWallets,
  },
])

const wagmiClient = createClient({ autoConnect: true, connectors, provider })

// Web3Wrapper
export function Web3Wrapper({ children }) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        appInfo={{
          appName: app.name,
          learnMoreUrl: app.url,
        }}
        chains={chains}
        initialChain={shardeumChain} // Optional, initialChain={1}, initialChain={chain.mainnet}, initialChain={gnosisChain}
        showRecentTransactions={true}
        theme={resolvedTheme === 'dark' ? darkTheme() : lightTheme()}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
