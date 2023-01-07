import { Component, EventEmitter, Output } from '@angular/core';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent {
    address: any;
    @Output() connect = new EventEmitter();
    constructor(private ws: WalletService){
        // this.ws.newGame();
        this.ws.initContract();
        this.ws.listAccounts().then(
            (add: any) => {
                this.address = add;
                this.connect.emit();
                // this.ws.initContract();
            }
        ).catch(
            (e) => {
                console.log(e);
            }
        )
    }
    connectWallet(){
        this.ws.getAccounts().then(
            (add: any) => {
                this.address = add;
                this.connect.emit();
                // this.ws.initContract();
            }
        ).catch(
            (e) => {
                console.log(e);
            }
        )
    }
}
