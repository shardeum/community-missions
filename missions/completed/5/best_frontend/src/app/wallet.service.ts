declare global {
    interface Window {
		ethereum: any,
        provdr: any,
        dataa: any
    }
}
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
@Injectable({
    providedIn: 'root'
})
export class WalletService {

    provider: any;
    contractInstance: any;
    //0x41d0e1AaD73530A8d8422A0b855de60503755872
    ctAddress: any = "0x1a85bf18d20BD2279a6a57b4C718b1d3C42AA935";
    ctABI: any = [
        {
            "inputs": [],
            "name": "newGame",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint8[7][6]",
                            "name": "boardState",
                            "type": "uint8[7][6]"
                        },
                        {
                            "internalType": "uint8",
                            "name": "playerWins",
                            "type": "uint8"
                        },
                        {
                            "internalType": "uint8",
                            "name": "computerWins",
                            "type": "uint8"
                        },
                        {
                            "internalType": "uint8",
                            "name": "tiedGames",
                            "type": "uint8"
                        },
                        {
                            "internalType": "string",
                            "name": "message",
                            "type": "string"
                        }
                    ],
                    "internalType": "struct Connect4.PlayerStates",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint8",
                    "name": "col",
                    "type": "uint8"
                }
            ],
            "name": "playerMove",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint8[7][6]",
                            "name": "boardState",
                            "type": "uint8[7][6]"
                        },
                        {
                            "internalType": "uint8",
                            "name": "playerWins",
                            "type": "uint8"
                        },
                        {
                            "internalType": "uint8",
                            "name": "computerWins",
                            "type": "uint8"
                        },
                        {
                            "internalType": "uint8",
                            "name": "tiedGames",
                            "type": "uint8"
                        },
                        {
                            "internalType": "string",
                            "name": "message",
                            "type": "string"
                        }
                    ],
                    "internalType": "struct Connect4.PlayerStates",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getGameState",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint8[7][6]",
                            "name": "boardState",
                            "type": "uint8[7][6]"
                        },
                        {
                            "internalType": "uint8",
                            "name": "playerWins",
                            "type": "uint8"
                        },
                        {
                            "internalType": "uint8",
                            "name": "computerWins",
                            "type": "uint8"
                        },
                        {
                            "internalType": "uint8",
                            "name": "tiedGames",
                            "type": "uint8"
                        },
                        {
                            "internalType": "string",
                            "name": "message",
                            "type": "string"
                        }
                    ],
                    "internalType": "struct Connect4.PlayerStates",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    constructor() {
        if(this.isEthereumAvailable()){
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            //this.provider = new ethers.providers.JsonRpcProvider('https://liberty20.shardeum.org:8081/');
		}
    }
    isEthereumAvailable(): boolean{
        if(window && window.ethereum){
            return true;
        }
        return false;
    }
    initContract(){
        // if(!this.contractInstance){
            this.contractInstance = new ethers.Contract(this.ctAddress, this.ctABI, this.provider.getSigner());
            // debugger;
        // }
    }
    newGame(){
        return new Promise( (resolve, reject) => {
            this.contractInstance?.newGame().then(
                (data: any) => {
                    // debugger;
                    // resolve(data.boardState);
                    data.wait().then(
                        (dt: any) => {
                            // debugger
                            resolve(data);
                        }
                    )
                    // resolve(data);
                }
            )    
        });
        // // this.contractInstance.playerMove(3);
        // setTimeout(() => {
        //     this.contractInstance.getGameState().then(
        //         (data: any) => {
        //             window['dataa'] = data;
        //         }
        //     ).catch(
        //         (e: any) => {
        //             console.log(e);
        //         }
        //     )
        // }, 25000);
        
    }
    playerMove(col: number){
        return new Promise ( async (resolve, reject) =>{
            // this.contractInstance.playerMove(col).on("ExecutedSoFar", (msg: any) => {
            //     console.log(msg);
            // });
            this.contractInstance?.playerMove(col).then(
                (data: any) => {
                    // debugger;
                    // resolve(data.boardState);
                    data.wait().then(
                        (dt: any) => {
                            // debugger
                            resolve(data);
                        }
                    )
                    // resolve(data);
                }
            )
            // debugger;
            // resolve(data.boardState);
        });
    }
    getBoard(){
        return new Promise ( (resolve, reject) => {
            this.contractInstance?.getGameState().then(
                (data: any) => {
                    resolve(data);
                }
            ).catch(
                (e: any) => {
                    console.log(e);
                }
            )
        });
    }
    listAccounts(){
        return new Promise( async (resolve, reject) => {
            let accounts = await this.provider.listAccounts();
            if(accounts.length){
                resolve(accounts[0]);
                this.initContract();
            }
            else{
                reject(false);
            }
        })
    }
    getAccounts(){
		return new Promise( async (resolve, reject) => {
            // let bn = await this.provider.getBlockNumber();
            // console.log(bn);

			this.provider.send('eth_requestAccounts', []).then(
				(data: string[]) => {
                    resolve(data[0]);
                    this.initContract();
				}
			).catch(
				(e: any) => {
					reject(e);
				}
			)
		})
	}
}
