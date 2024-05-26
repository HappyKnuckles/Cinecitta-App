// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FilmSelectComponent } from './film-select.component';
@NgModule({
  declarations: [
    FilmSelectComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [
    FilmSelectComponent
  ]
})
export class FilmSelectModule { }
