import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonThumbnail,
  IonImg,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ProfilePageRoutingModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonThumbnail,
    IonImg,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonModal,
    IonButtons,
    IonButton,
    ProfilePage,
  ],
})
export class ProfilePageModule {}
