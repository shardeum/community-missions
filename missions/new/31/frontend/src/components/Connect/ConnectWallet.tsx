import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface Props {
  show?: 'always' | 'connected' | 'disconnected'
}

export default function ConnectWallet({ show = 'always' }: Props) {
  const { isConnected } = useAccount()
  if ((show === 'connected' && !isConnected) || (show === 'disconnected' && isConnected)) return null
  return <ConnectButton />
}
