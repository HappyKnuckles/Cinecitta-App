import { Component, input, model, OnInit, output, SimpleChanges } from '@angular/core';
import * as Filtertags from '../../models/filtertags';
import { ModalController } from '@ionic/angular';
import { IonButton, IonButtons, IonTitle, IonToolbar, IonHeader, IonIcon, IonContent, IonSelectOption, IonSelect, IonList, IonItem, IonModal, IonFooter, IonPicker, IonLabel } from "@ionic/angular/standalone";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilmDataService } from 'src/app/services/film-data/film-data.service';

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
  selectedLeinwandHighlights = model([this.leinwandHighlights[0].id]);
  selectedExtras = model([]);
  selectedFlags = model([]);
  selectedBehindertenTags = model([]);
  selectedTageAuswahl = model(this.tageAuswahl[0].id);
  selectedStartTime = model('10:00');
  selectedEndTime = model('03:00');

  constructor(private modalCtrl: ModalController, private filmData: FilmDataService) { }

ngOnInit(): void {
    console.log('ngOnInit');
}

  reset() {

  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  async confirm() {
    const formData = this.getFormData();
    this.modalCtrl.dismiss(formData)
    console.log(await this.filmData.fetchFilmData(formData))
  }

  getFormData(){
      const formData = new FormData();

      formData.append('get_filter_aktiv', 'false');
      formData.append('filter[ovfilme]', '0');
      // Append selected filters to the form data
      this.selectedGenres().forEach((id: number) => formData.append('filter[genres_tags][]', id.toString()));
      if (this.selectedLeinwandHighlights().length > 0) {
        formData.append('filter[leinwand_highlight]', this.selectedLeinwandHighlights()[0].toString());
      }
      if (this.selectedTageAuswahl().length > 0) {
        formData.append('filter[tage_auswahl]', this.selectedTageAuswahl()[0]);
      }
      this.selectedExtras().forEach((extra: string) => formData.append('filter[extra][]', extra));
      this.selectedFlags().forEach((id: number) => formData.append('filter[releasetypen_flags][]', id.toString()));
      this.selectedBehindertenTags().forEach((id: number) => formData.append('filter[barrierefrei_tags][]', id.toString()));

    const startTimeNumeric = this.convertTimeToNumeric(this.selectedStartTime());
      const endTimeNumeric = this.convertTimeToNumeric(this.selectedEndTime());
      formData.append('filter[rangeslider][]', String(startTimeNumeric));
      formData.append('filter[rangeslider][]', String(endTimeNumeric));

      return formData;
    
  }

  convertTimeToNumeric(timeStr: string): number {
    // Split the time string into hours and minutes
    const [hoursStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);

    // Convert the time to numeric representation
    let numericTime = hours;

    // Special case: If the time is below 10 add 24
    if (hours < 10) {
      numericTime += 24;
    }
    return numericTime;
  }



}