import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmOverviewPage } from './filmoverview.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';
import { FilmOverviewRoutingmodule } from './filmoverview-routing.module';
import { ExtractTextModule } from 'src/app/Pipes/extract-text.module';
import { SearchComponent } from 'src/app/common/search/search.component';
import { SearchModule } from 'src/app/common/search/search.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    FilmOverviewRoutingmodule,
    ExtractTextModule,
    SearchModule
  ],
  providers: [
    
  ],
  declarations: [FilmOverviewPage]
})
export class FilmoverviewModule {}
