import { Component } from '@angular/core';
import { ethers } from 'ethers';
import { Web3Service } from './shared/web3.service';
import { environments } from '../environment/environment';
import { WalletService } from './shared/wallet.service';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	isConnected: boolean = false;
    address: any;
	loading: boolean = false;
	result: any;
	constructor(private web3: Web3Service, private ws: WalletService){
		this.ws.walletObservable$.subscribe(
            (data: any) => {
                if(data != ""){
                    this.isConnected = true;
                    this.address = data;
                }
            }
        )
		this.ws.listAccounts();
	}
	connectWallet(){
        this.ws.getAccounts();
    }
	async verifyProof(){
		this.loading = true;
		let proof = (document.getElementById('proof') as HTMLTextAreaElement).value;
		let pubSignal = (document.getElementById('pubsignal') as HTMLInputElement).value;
		this.result = await this.web3.verifyProof(proof, [pubSignal]);
		this.loading = false;
	}
}
