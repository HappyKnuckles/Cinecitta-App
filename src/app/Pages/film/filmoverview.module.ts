import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmOverviewPage } from './filmoverview.page';
import { ExtractTextPipe } from 'src/app/Pipes/extract-text.pipe';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { FilmOverviewRoutingmodule } from './filmoverview-routing.module';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    FilmOverviewRoutingmodule
  ],
  providers: [
    InAppBrowser
  ],
  declarations: [FilmOverviewPage,ExtractTextPipe]
})
export class FilmoverviewModule {}
