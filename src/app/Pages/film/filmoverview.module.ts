import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmOverviewPage } from './filmoverview.page';
import { FilmOverviewRoutingmodule } from './filmoverview-routing.module';
import { ExtractTextModule } from 'src/app/Pipes/extract-text/extract-text.module';
import { SearchModule } from 'src/app/common/search/search.module';
import { TransformTimeModule } from 'src/app/Pipes/time-transformer/transform-time.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    FilmOverviewRoutingmodule,
    ExtractTextModule,
    SearchModule,
    TransformTimeModule
  ],
  providers: [
    
  ],
  declarations: [FilmOverviewPage]
})
export class FilmoverviewModule {}
