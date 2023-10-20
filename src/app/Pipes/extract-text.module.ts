// shared.module.ts
import { NgModule } from '@angular/core';
import { ExtractTextPipe } from './extract-text.pipe';

@NgModule({
  declarations: [ExtractTextPipe],
  exports: [ExtractTextPipe]
})
export class ExtractTextModule {}