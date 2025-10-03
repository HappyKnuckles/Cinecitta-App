import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appDoubleClickLike]',
  standalone: true
})
export class DoubleClickLikeDirective {
  @Output() doubleClickLike = new EventEmitter<MouseEvent>();

  @HostListener('dblclick', ['$event'])
  onDoubleClick(event: MouseEvent): void {
    event.stopPropagation();
    this.doubleClickLike.emit(event);
  }
}
