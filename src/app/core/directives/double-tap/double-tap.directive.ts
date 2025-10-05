import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appDoubleClickLike]',
  standalone: true
})
export class DoubleTapDirective {
  @Output() doubleTap = new EventEmitter<Event>();

  private lastTapTime = 0;
  private readonly DOUBLE_TAP_DELAY = 75; // milliseconds

  @HostListener('dblclick', ['$event'])
  onDoubleClick(event: MouseEvent): void {
    event.stopPropagation();
    this.doubleTap.emit(event);
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTapTime;

    if (tapLength < this.DOUBLE_TAP_DELAY && tapLength > 0) {
      event.preventDefault();
      event.stopPropagation();
      this.doubleTap.emit(event);
      this.lastTapTime = 0;
    } else {
      this.lastTapTime = currentTime;
    }
  }
}
