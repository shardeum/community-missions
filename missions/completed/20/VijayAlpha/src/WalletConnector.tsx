import Fab from '@mui/material/Fab';
import Backdrop from '@mui/material/Backdrop';
import { useEffect, useState } from 'react';

const testnetChainId = '8081'

export default function WalletConnector() {
  const { ethereum } = window;

  if (!ethereum) {
    alert("Make sure you have Metamask installed!");
  }
  else {
    ethereum.on('chainChanged', () => {
      window.location.reload()
    })
    ethereum.on('accountsChanged', () => {
      window.location.reload()
    })
  }

  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [correctChain, setCorrectChain] = useState<boolean | null>(null);

  const checkWalletIsConnected = async () => {

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }

  const connectWalletHandler = async () => {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const checkChainId = async () => {
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Chain ID:", chainId, parseInt(chainId) , parseInt(testnetChainId));
    
    setCorrectChain(parseInt(chainId) === parseInt(testnetChainId));
  }

  const changeChainId = async () => {
    let chainId = await ethereum.request({ method: 'eth_chainId' });

    if (chainId !== testnetChainId) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{
            chainId: testnetChainId
          }], // chainId must be in hexadecimal numbers
        });
        chainId = await ethereum.request({ method: 'eth_chainId' });
      } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: testnetChainId,
                  chainName: 'Shardeum Liberty 2.X',
                  nativeCurrency: {
                    name: 'Shardeum',
                    symbol: 'SHM',
                    decimals: 18
                  },
                  rpcUrls: ['	https://liberty20.shardeum.org/'],
                  blockExplorerUrls: ['https://explorer-liberty20.shardeum.org/']
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
        console.error(error);
      }
      window.location.reload();
    }
    setCorrectChain(chainId === testnetChainId);
  }

  const changeAccount = async () => {
    await ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{
        eth_accounts: {},
      }]
    });
    window.location.reload();
  }

  useEffect(() => {
    checkWalletIsConnected();
    checkChainId();
  })


  const ConnectWalletFab = () => {
    return (
      <div>
        <Backdrop open={true} />
        <Fab variant="extended" color="primary" onClick={connectWalletHandler} sx={{
          position: "fixed",
          bottom: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2)
        }}>
          Connect Wallet
        </Fab>
      </div>
    )
  }

  const WrongNetworkFab = () => {    
    return (
      <div>
        <Backdrop open={true} />
        <Fab variant="extended" color="secondary" sx={{
          position: "fixed",
          bottom: (theme) => theme.spacing(2),
          right: (theme) => theme.spacing(2)
        }}
        >
          Change to Shardeum Liberty 2.X
        </Fab>
      </div>
    )
  }

  const AccountFab = () => {
    return (
      <Fab variant="extended" onClick={changeAccount} sx={{
        position: "fixed",
        top: "auto",
        bottom: (theme) => theme.spacing(3),
        right: (theme) => theme.spacing(2)
      }}>
        {currentAccount?.slice(0, 8)}...{currentAccount?.slice(-5)}
      </Fab>
    )
  }

  return (
    <div>
      {(currentAccount && correctChain) ? <AccountFab /> : (currentAccount ? <WrongNetworkFab /> : <ConnectWalletFab />)}
    </div>
  )
}
