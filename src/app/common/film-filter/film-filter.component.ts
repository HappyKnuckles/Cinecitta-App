import { Component, input, model, OnInit, output, SimpleChanges } from '@angular/core';
import * as Filtertags from '../../models/filtertags';
import { ModalController } from '@ionic/angular';
import { IonButton, IonButtons, IonTitle, IonToolbar, IonHeader, IonIcon, IonContent, IonSelectOption, IonSelect, IonList, IonItem, IonModal, IonFooter, IonPicker, IonLabel } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-film-filter',
  templateUrl: './film-filter.component.html',
  styleUrls: ['./film-filter.component.scss'],
  standalone: true,
  providers: [ModalController],

  imports: [IonLabel, IonPicker, IonFooter, IonModal, IonItem, IonList, IonContent, CommonModule, FormsModule, IonSelectOption, IonSelect, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,],
})
export class FilmFilterComponent implements OnInit {
  filters = Filtertags.filters;
  tageAuswahl = Filtertags.tageAuswahl;
  genresTag = Filtertags.genresTag;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;
  flags = Filtertags.flags;
  behindertenTags = Filtertags.behindertenTags;
  defaultFilters = Filtertags.selectedFilters;
  selectedTags = model([]);
  selectedGenres = model([]);
  selectedLeinwandHighlights = model(this.leinwandHighlights[0].id);
  selectedExtras = model([]);
  selectedFlags = model([]);
  selectedBehindertenTags = model([]);
  selectedTageAuswahl = model(this.tageAuswahl[0].id);
  selectedStartTime = model('10:00');
  selectedEndTime = model('03:00');

  constructor(private modalCtrl: ModalController) { }

ngOnInit(): void {
    console.log('ngOnInit');
    console.log(this.selectedTags());
  console.log(this.selectedGenres());
  console.log(this.selectedLeinwandHighlights());
  console.log(this.selectedExtras());
  console.log(this.selectedFlags());
  console.log(this.selectedBehindertenTags());
  console.log(this.selectedTageAuswahl());
}

  reset() {

  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  confirm() {
    this.modalCtrl.dismiss({
      data: {
        selectedTags: this.selectedTags(),
        selectedGenres: this.selectedGenres(),
        selectedLeinwandHighlights: this.selectedLeinwandHighlights(),
        selectedExtras: this.selectedExtras(),
        selectedFlags: this.selectedFlags(),
        selectedBehindertenTags: this.selectedBehindertenTags(),
        selectedTageAuswahl: this.selectedTageAuswahl(),
        selectedStartTime: this.selectedStartTime(),
        selectedEndTime: this.selectedEndTime(),}
    });
  }




}