import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsPage } from './newspage.page';


import { NewsPageRoutingModule } from './newspage-routing.module';

import { IonText, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent, IonRefresher, IonGrid, IonRow, IonImg, IonCol } from "@ionic/angular/standalone";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		NewsPageRoutingModule,
		IonText,
		IonHeader,
		IonToolbar,
		IonTitle,
		IonButton,
		IonIcon,
		IonContent,
		IonRefresher,
		IonGrid,
		IonRow,
		IonImg,
		IonCol,
		NewsPage
	]
})
export class NewsPageModule { }
