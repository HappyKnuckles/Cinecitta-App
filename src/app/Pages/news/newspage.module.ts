import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsPage } from './newspage.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';


import { NewsPageRoutingModule } from './newspage-routing.module';
import { ExtractTextModule } from 'src/app/Pipes/extract-text.module';
import { SearchComponent } from 'src/app/common/search/search.component';
import { SearchModule } from 'src/app/common/search/search.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    NewsPageRoutingModule,
    ExtractTextModule,
    SearchModule
  ],
  declarations: [NewsPage]
})
export class NewsPageModule {}
