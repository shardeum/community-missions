import { Component } from '@angular/core';
import { WalletService } from './shared/wallet.service';
import { Web3Service } from './shared/web3.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent {
	isConnected: boolean = false;
    address: any;
	board: any;
	loading: boolean = false;
	hasObstacle: boolean = false;
    constructor(private ws: WalletService, private web3: Web3Service){
        this.ws.walletObservable$.subscribe(
            (data: any) => {
                if(data != ""){
                    this.isConnected = true;
                    this.address = data;
                }
            }
        )
		this.web3.web3Observable$.subscribe(
			(data: boolean) => {
				if(data){
					this.web3.getBoard().then(
						(board) => {
							this.board = board;
							board.currentRoomCoordinates.forEach(
								(x: any) => {
									if(x.findIndex((y: number) => y == 1) > -1){
										this.hasObstacle = true;
									}
								}
							)
						}
					)
				}
			}
		)
        this.ws.listAccounts();
    }
    connectWallet(){
        this.ws.getAccounts();
    }

	generateNewBoard(){
		this.loading = true;
		this.web3.newBoard().then(
			(board) => {
				this.board = board;
				this.hasObstacle = true;
				this.loading = false;
			}
		).catch(
			() => {
				this.loading = false;
			}
		)
	}

	findPaths(){
		this.loading = true;
		this.web3.findPaths().then(
			(board) => {
				this.board = board;
				this.hasObstacle = true;
				this.loading = false;
			}
		).catch(
			() => {
				this.loading = false;
			}
		)
	}
}
