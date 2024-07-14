// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FilmSelectComponent } from './film-select.component';
import { ExtractTextModule } from 'src/app/Pipes/extract-text.module';
@NgModule({
  declarations: [
    FilmSelectComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ExtractTextModule
  ],
  exports: [
    FilmSelectComponent
  ]
})
export class FilmSelectModule { }
