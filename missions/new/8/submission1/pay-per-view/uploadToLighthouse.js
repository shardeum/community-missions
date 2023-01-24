require("dotenv").config();
const { ethers } = require("ethers");
const lighthouse = require('@lighthouse-web3/sdk');

const sign_auth_message = async(publicKey, privateKey) =>{
  const provider = new ethers.providers.JsonRpcProvider();
  const signer = new ethers.Wallet(privateKey, provider);
  const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data.message;
  const signedMessage = await signer.signMessage(messageRequested);
  return(signedMessage)
}

const deployEncrypted = async() =>{
  const path = ".../branding/arb.png";	//Give absolute path
  const apiKey = process.env.API_KEY;
  const publicKey = "0x2B68407d77B044237aE7f99369AA0347Ca44B129";
  const privateKey = process.env.PRIVATE_KEY;
  const signed_message = await sign_auth_message(publicKey, privateKey);

  const response = await lighthouse.uploadEncrypted(
    path,
    apiKey,
    publicKey,
    signed_message
  );
  // Display response
  console.log(response);
  /*
    {
      Name: 'flow1.png',
      Hash: 'QmQqfuFH77vsau5xpVHUfJ6mJQgiG8kDmR62rF98iSPRes',
      Size: '31735'
    }
    Note: Hash in response is CID.
  */
}

deployEncrypted()