import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';

@Injectable({
    providedIn: 'root'
})
export class GameService {

    board: number[][];
    rows: number = 6;
    cols: number = 7;
    constructor(private ws: WalletService){
        this.board = Array.from({length: this.rows}, () => Array.from({length: this.cols}, () => 0));
    }
    getBoard(){
        return new Promise( (resolve, reject) => {
            this.ws.getBoard().then(
                (data: any) => {
                    console.log(data);
                    resolve(data)
                }
            )
        })
    }
    newGame(){
        return new Promise( (resolve, reject) => {
            this.ws.newGame().then(
                (data: any) => {
                    this.getBoard().then(
                        (data: any) => {
                            resolve(data);
                        }
                    )
                }
            )
        })
    }
    resetBoard(){
        this.board = Array.from({length: this.rows}, () => Array.from({length: this.cols}, () => 0));
    }
    playerMove(col: number){
        return new Promise( (resolve, reject) => {
            this.ws.playerMove(col).then(
                (data: any) => {
                    this.getBoard().then(
                        (data: any) => {
                            // debugger;
                            resolve(data);
                        }
                    )
                }
            )
        })
    }
}
