import { Component, model, OnInit } from '@angular/core';
import * as Filtertags from '../../models/filtertags';
import { ModalController } from '@ionic/angular';
import { IonButton, IonButtons, IonTitle, IonToolbar, IonHeader, IonIcon, IonContent, IonSelectOption, IonSelect, IonList, IonItem, IonModal, IonFooter, IonPicker, IonLabel } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmDataService } from 'src/app/services/film-data/film-data.service';
import { FilterService } from 'src/app/services/filter/filter.service';
import { Filter } from '../../models/filtertags';

@Component({
  selector: 'app-film-filter',
  templateUrl: './film-filter.component.html',
  styleUrls: ['./film-filter.component.scss'],
  standalone: true,
  providers: [ModalController],

  imports: [IonFooter, IonItem, IonList, IonContent, CommonModule, FormsModule, IonSelectOption, IonSelect, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton],
})
export class FilmFilterComponent  {
  defaultFilters = this.filterService.defaultFilters;
  tageAuswahl = Filtertags.tageAuswahl;
  genresTag = Filtertags.genresTag;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;
  flags = Filtertags.flags;
  behindertenTags = Filtertags.behindertenTags;
 

  constructor(private modalCtrl: ModalController, public filterService: FilterService) { }



  reset() {
    this.filterService.resetFilters();
  }

  updateFilter<T extends keyof Filter>(key: T, value: unknown) {
    console.log(key, value);
    this.filterService.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  cancel() {
    this.filterService.filters.set(localStorage.getItem('filter') ? JSON.parse(localStorage.getItem('filter')!) : this.filterService.filters());
    this.modalCtrl.dismiss();
  }

  confirm() {
    // const formData = this.getFormData();
    this.filterService.filters.update((filters) => ({...filters}));
    this.filterService.saveFilters();
    this.modalCtrl.dismiss()
  }
}