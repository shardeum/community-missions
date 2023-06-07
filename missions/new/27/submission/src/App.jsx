import './App.css'
import { ConnectKitButton } from 'connectkit';
import Feature from './Feature';
import { useAccount } from 'wagmi';
function App() {
  const {address} = useAccount();
  return (
    <>
      {address? <Feature/> : <ConnectKitButton theme='retro' showAvatar={true}  />}
    </>
  )
}

export default App
