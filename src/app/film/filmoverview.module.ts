import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmOverviewPage } from './filmoverview.page';
import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { FilmOverviewRoutingmodule } from './filmoverview-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ExploreContainerComponentModule,
    FilmOverviewRoutingmodule
  ],
  declarations: [FilmOverviewPage]
})
export class FilmoverviewModule {}
