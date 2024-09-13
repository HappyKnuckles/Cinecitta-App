import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmOverviewPage } from './filmoverview.page';
import { FilmOverviewRoutingmodule } from './filmoverview-routing.module';

import {
  IonBackdrop,
  IonText,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonTitle,
  IonModal,
  IonButtons,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonDatetime,
  IonFooter,
  IonRefresher,
  IonImg,
  IonPopover,
} from '@ionic/angular/standalone';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FilmOverviewRoutingmodule,
    IonBackdrop,
    IonText,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonTitle,
    IonModal,
    IonButtons,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonSelect,
    IonSelectOption,
    IonLabel,
    IonDatetime,
    IonFooter,
    IonRefresher,
    IonImg,
    IonPopover,
    FilmOverviewPage,
  ],
  providers: [],
})
export class FilmoverviewModule {}
