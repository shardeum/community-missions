import { Injectable } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
import { environment } from '../../environment/environment';
import { WalletService } from './wallet.service';
import * as lighthouse from '@lighthouse-web3/sdk';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class Web3Service {

    contractInstance: any;
    url ?: string;
    userOwnNFTObservable$ = new BehaviorSubject<string>("");
    constructor(private ws: WalletService) {
        this.ws.walletObservable$.subscribe(
            (data) => {
                if(data != "" && !this.contractInstance){
                    this.initContract();
                }
            }
        );
    }
    async initContract(){
        if(!this.contractInstance){
            // debugger;
            this.contractInstance = await new ethers.Contract(environment.NFT_CONTRACT, environment.NFT_ABI, this.ws.getProvider().getSigner());
            await this.checkIfUserOwnNFT();
        }
    }
    async sign_auth_message(){

        const signer = this.ws.getProvider().getSigner();
        const publicKey = (await signer.getAddress()).toLowerCase();
        const messageRequested = (await lighthouse.getAuthMessage(publicKey)).data.message;
        const signedMessage = await signer.signMessage(
          messageRequested
        );
        return({publicKey: publicKey, signedMessage: signedMessage});
    }

    async decrypt(){
        const cid = "QmZP1ij56K5Mzv8RXm4unB85Qgp9ZoJvPGairsyVR9B8kB"; //replace with your IPFS CID
        const {publicKey, signedMessage} = await this.sign_auth_message();
        console.log(signedMessage)
        /*
          fetchEncryptionKey(cid, publicKey, signedMessage)
            Parameters:
              CID: CID of the file to decrypt
              publicKey: public key of the user who has access to file or owner
              signedMessage: message signed by the owner of publicKey
        */
        const keyObject = await lighthouse.fetchEncryptionKey(
          cid,
          publicKey,
          signedMessage
        );
    
        // Decrypt file
        /*
          decryptFile(cid, key, mimeType)
            Parameters:
              CID: CID of the file to decrypt
              key: the key to decrypt the file
              mimeType: default null, mime type of file
        */
       
        const fileType = "image/jpeg";
        const decrypted = await lighthouse.decryptFile(cid, keyObject.data.key);
        console.log(decrypted)
        /*
          Response: blob
        */
    
        // View File
        const url = URL.createObjectURL(decrypted);
        console.log(url);
        this.url = url;
    }

    getUrl(){
        return this.url;
    }

    async checkIfUserOwnNFT(){
        try{
            let address = await this.ws.getAddress();
            let balance = await this.contractInstance.balanceOf(address);
            let tokenBalance = BigNumber.from(balance);
            if(tokenBalance > BigNumber.from(0)){
                this.userOwnNFTObservable$.next('true');
            }
            else{
                this.userOwnNFTObservable$.next('false');
            }
        }
        catch(e: any){
            console.log(e);
        }
    }

    async buyNFT(){
        try{
            let options = { value: ethers.utils.parseUnits("2", "ether") };
            let tx = await this.contractInstance.mintNFT(options);
            await tx.wait();
            await this.checkIfUserOwnNFT();
        }
        catch(e: any){
            console.log(e);
        }
    }
}
