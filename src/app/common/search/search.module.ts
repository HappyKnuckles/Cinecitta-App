// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    SearchComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ],
  exports: [
    SearchComponent // Export the SearchComponent so it can be used in other modules
  ]
})
export class SearchModule { }
