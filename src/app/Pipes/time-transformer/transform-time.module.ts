// shared.module.ts
import { NgModule } from '@angular/core';
import { TransformTimePipe } from './transform-time.pipe';

@NgModule({
  declarations: [TransformTimePipe],
  exports: [TransformTimePipe]
})
export class TransformTimeModule {}