declare global {
  interface Window {
  ethereum: any,
  }
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ethers } from 'ethers';
@Injectable({
  providedIn: 'root'
})
export class WalletService {

  provider: any;
  chainId: any;
  address: any;
  walletObservable$ = new BehaviorSubject<string>("");
  constructor() {
  if(this.isEthereumAvailable()){
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
  }
  }
  getProvider(){
      return this.provider;
  }
  getChainId(): any{
      return this.chainId.toString();
  }
  async setChainId(){
      if(!this.chainId){
          this.chainId = await this.provider.getNetwork().chainId;
      }
  }
  async listAccounts(){
          let accounts = await this.provider.listAccounts();
          if(accounts.length){
              this.walletObservable$.next(accounts[0]);
              this.address = accounts[0];
              this.setChainId();
          }
  }
  isEthereumAvailable(): boolean{
  if(window && window.ethereum){
    return true;
  }
  return false;
  }
  async getAddress(){
      if(!this.address){
          await this.getAccounts();
      }
      return this.address;
  }
async getAccounts(){
      let accounts = await this.provider.send('eth_requestAccounts', []);
      if(accounts.length){
          this.walletObservable$.next(accounts[0]);
          this.address = accounts[0];
          this.setChainId();
      }
}
}