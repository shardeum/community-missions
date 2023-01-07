import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { GameService } from '../game.service';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.less']
})
export class BoardComponent {
    board: any;
    colIndex ?: number;
    loading: boolean = true;
    data: any;
    message: any;
    walConnected: any;
    @Input() ctd: boolean = false;
    constructor(private game: GameService, private cdr: ChangeDetectorRef, private ws: WalletService){
        this.game.getBoard().then(
            (data: any) => {
                this.data = data;
                this.message = data.message;
                this.board = this.copyBoard(data.boardState);
                this.loading = false;
            }
        )
        this.ws.listAccounts().then(
            (add: any) => {
                this.walConnected = add.length == 0 ? false : true;
            }
        ).catch(
            (e) => {
                console.log(e);
            }
        )
    }
    setColIndex(x: number){
        this.colIndex = x;
    }
    copyBoard(board: any){
        return board.map((x: any) => x.map((y: any) => y));
    }
    // aiMove(){

    // }
    findRow(col: number){
        return this.board.findIndex((x: any) => x[col] == 0);
    }
    newGame(){
        this.loading = true;
        this.game.newGame().then(
            (data: any) => {
                this.data = data;
                this.board = this.copyBoard(data.boardState);
                this.loading = false;
            }
        )
    }
    dropBall(x: number){
        if(this.message != ""){
            return;
        }
        this.loading = true;
        // debugger;
        // let board = [...this.board];
        // board[this.findRow(x)][x] = 1;
        // this.board = board;
        this.board[this.findRow(x)][x] = 1;
        // this.loading = false;
        this.game.playerMove(x).then(
            (data: any) => {
                // debugger;
                this.data = data;
                this.board = this.copyBoard(data.boardState);
                this.loading = false;
                // this.cdr.detectChanges();
            }
        )
    }
}
