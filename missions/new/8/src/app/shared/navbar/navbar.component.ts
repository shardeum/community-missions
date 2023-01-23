import { Component } from '@angular/core';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent {
    isConnected: boolean = false;
    address: any;
    constructor(private ws: WalletService){
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
}
