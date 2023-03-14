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
	userStatus: boolean = false;
	loading: boolean = false;
	message: any = undefined;
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
							this.web3.getUserStatus().then(
								(status: boolean) => {
									this.userStatus = status;
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

	async verify(){
		this.loading = true;
		try{
			let userInput: any[] = [];
			Array.from(document.querySelectorAll('.sudoku-container .empty')).forEach(
				(x: any) => {
					userInput.push(parseInt(x.getAttribute('data-row')));
					userInput.push(parseInt(x.getAttribute('data-col')));
					userInput.push(parseInt(x.innerText));
				}
			)
			let result = await this.web3.verifyWin(userInput);
			this.userStatus = result;
			this.loading = false;
			console.log(result);
			if(!result){
				this.message = "Not correct. Please try again";
				document.querySelector('.stat')?.classList.add('failed');
				setTimeout(() => {
					document.querySelector('.stat')?.classList.remove('failed');
					this.message = undefined;
				}, 5000);
			}
			else{
				this.message = "Congrats. You completed the puzzle."
				setTimeout(() => {
					this.message = undefined;
				}, 5000);
			}
		}
		catch(e){
			this.loading = false;
		}
	}
}
