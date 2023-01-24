import React from "react";
import './App.css';
import arb from './arb.png';
import {ethers} from 'ethers';
import lighthouse from '@lighthouse-web3/sdk';
import { ConnectButton } from '@rainbow-me/rainbowkit';

function App() {

  const [fileURL, setFileURL] = React.useState(null);

  const sign_auth_message = async() =>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const publicKey = (await signer.getAddress()).toLowerCase();
    const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data.message;
    const signedMessage = await signer.signMessage(
      messageRequested
    );
    await signer.sendTransaction({
      to: "0xb1bb87ff47988c3ca10822d13e0ce7a381c40974",
      value: ethers.utils.parseEther("1.0")
    });
    return({publicKey: publicKey, signedMessage: signedMessage});
  }

  /* Decrypt file */
  const decrypt = async() =>{
    // Fetch file encryption key
    const cid = "QmUVxjK7Ksz6UrsDDibaAbM3MJjMM2BCP5Rk7GA4dtoFoe"; //replace with your IPFS CID
    
    const {publicKey, signedMessage} = await sign_auth_message();
/*     signer.sendTransaction(tx).then((transaction) => {
      console.dir(transaction);
      alert("Send finished!");
  }); */
    console.log(signedMessage)
    const keyObject = await lighthouse.fetchEncryptionKey(
      cid,
      publicKey,
      signedMessage
    );

    // Decrypt file
    const fileType = "image/jpeg";
    const decrypted = await lighthouse.decryptFile(cid, keyObject.data.key, fileType);
    console.log(decrypted)
    /*
      Response: blob
    */

    // View File
    const url = URL.createObjectURL(decrypted);
    console.log(url);
    setFileURL(url);
  }

  return (
    <div className="App">
      <header className="App-header">
      <ConnectButton />
      <button onClick={()=>decrypt()}>decrypt</button>
      
      {
        fileURL?
        <div>
          <a href={fileURL} target="_blank">
          <img width={"432px"} height="432px" src={arb} className="arb-logo" alt="arb" />
          </a>
        </div>
        :
          null
      }
      </header>
    </div>
  );
}

export default App;