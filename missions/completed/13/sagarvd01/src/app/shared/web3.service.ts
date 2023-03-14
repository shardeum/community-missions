import { Injectable } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
import { environments } from '../../environment/environment';
import { WalletService } from './wallet.service';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class Web3Service {

    contractInstance: any;
    web3Observable$ = new BehaviorSubject<boolean>(false);
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
			this.contractInstance = await new ethers.Contract(environments.contract, environments.ABI, this.ws.getProvider().getSigner());
			this.web3Observable$.next(true);
        }
		else{
			this.web3Observable$.next(true);
		}
    }
    async getBoard(){
		let board = await this.contractInstance.getBoard();
		return board;
    }
	async getUserStatus(){
		let status = await this.contractInstance.getUserStats();
		return status;
	}

	async verifyWin(board: any){
		let tx = await this.contractInstance.verifyWin(board);
		await tx.wait();
		let result = await this.getUserStatus();
		return result;
	}
}