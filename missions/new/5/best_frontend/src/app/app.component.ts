import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
    constructor(){

    }
    ctd: boolean = false;
    conntected(){
        this.ctd = true;
    }
    
}
