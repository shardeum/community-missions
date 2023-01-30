import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addres'
})
export class AddresPipe implements PipeTransform {

    transform(value: string, ...args: any[]): string {
        if(value.length > 0){
            return value.slice(0,5) + "..." + value.slice(-5);
        }
        return value;
    }

}
