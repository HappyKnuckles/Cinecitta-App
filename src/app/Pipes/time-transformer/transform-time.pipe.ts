import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformTime',
  standalone: true
})
export class TransformTimePipe implements PipeTransform {

  transform(time: string): string {
    const hours = Math.floor(Number(time) / 60);
    const minutes = Number(time) % 60;
    return `${hours}h ${minutes}min`;
  }
}
