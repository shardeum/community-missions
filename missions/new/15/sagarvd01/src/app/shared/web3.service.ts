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
		let board = await this.contractInstance.getNewBoard();
		return board;
    }

	async newBoard(){
		let tx = await this.contractInstance.generateNewBoard();
		await tx.wait();
		let board = await this.getBoard();
		return board;
	}

	async findPaths(){
		let tx = await this.contractInstance.findPaths();
		await tx.wait();
		let board = await this.getBoard();
		return board;
	}
}