// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FilmSelectComponent } from './film-select.component';
import { ExtractTextModule } from 'src/app/Pipes/extract-text/extract-text.module';
import { TransformTimeModule } from 'src/app/Pipes/time-transformer/transform-time.module';
@NgModule({
  declarations: [
    FilmSelectComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ExtractTextModule,
    TransformTimeModule
  ],
  exports: [
    FilmSelectComponent
  ]
})
export class FilmSelectModule { }
