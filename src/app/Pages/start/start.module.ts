import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StartPage } from './start.page';
import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { StartPageRoutingModule } from './start-routing.module';
import { FilmSelectModule } from 'src/app/common/film-select/film-select.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    StartPageRoutingModule,
    FilmSelectModule
  ],
  declarations: [StartPage]
})
export class StartPageModule {}
