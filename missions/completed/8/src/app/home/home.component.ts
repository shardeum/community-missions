import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { WalletService } from '../shared/wallet.service';
import { Web3Service } from '../shared/web3.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent {
    address ?: string;
    url ?: SafeUrl;
    haveAccess: boolean = false;
    constructor(private ws: WalletService, private web3: Web3Service, private sanitize: DomSanitizer){
        this.ws.walletObservable$.subscribe(
            (data: any) => {
                if(data != ""){
                    this.address = data;
                }
            }
        )
        this.web3.userOwnNFTObservable$.subscribe(
            (data: any) => {
                if(data == 'true'){
                    this.haveAccess = true;
                }
            }
        )
    }

    async decryptFile(){
        try{
            await this.web3.decrypt();
            this.url = this.sanitize.bypassSecurityTrustUrl(this.web3.getUrl() as string);
        }
        catch(e: any){
            console.log(e);
        }
    }
    
    async getAccess(){
        await this.web3.buyNFT();
    }
}
