import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmOverviewPage } from './filmoverview.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { FilmOverviewRoutingmodule } from './filmoverview-routing.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ExtractTextModule } from 'src/app/Pipes/extract-text.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    FilmOverviewRoutingmodule,
    ExtractTextModule
  ],
  providers: [
    InAppBrowser
  ],
  declarations: [FilmOverviewPage]
})
export class FilmoverviewModule {}
