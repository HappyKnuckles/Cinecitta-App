import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extractText'
})
export class ExtractTextPipe implements PipeTransform {
  transform(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.innerText;
  }
}
