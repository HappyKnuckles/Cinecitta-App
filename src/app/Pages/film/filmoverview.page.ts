import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  IonContent,
  IonInput,
  IonModal,
} from '@ionic/angular';
import { Subject, Subscription, debounceTime } from 'rxjs';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { KeyboardResize } from '@capacitor/keyboard';
import { AlertController } from '@ionic/angular';
import * as Filtertags from './filtertags';
import { Browser } from '@capacitor/browser';
import { SearchComponent } from 'src/app/common/search/search.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'filmoverview.page.html',
  styleUrls: ['filmoverview.page.scss'],
  animations: [
    trigger('openClose', [
      state('true', style({ opacity: 0, 'font-size': '0', height: '0' })),
      state('false', style({ opacity: 1, 'font-size': '*', height: '*' })),
      transition('false <=> true', [animate('400ms ease-in-out')]),
    ]),
  ],
})
export class FilmOverviewPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild(SearchComponent, { static: false }) searchInput!: SearchComponent;

  showStartTimePicker: boolean = false;
  showEndTimePicker: boolean = false;
  startTime = '10:00';
  endTime = '03:00';
  formattedEndTime: string = "";
  films: any[] = [];
  filteredFilms: any[] = [];
  message = '';
  isTimesOpen: boolean[] = [];
  isSearchOpen: boolean = false;
  isModalOpen: boolean = false;
  isLoading: boolean = false;
  detailView: boolean[] = [true, false, false];
  showFull: boolean[] = [];
  showAllTags: boolean[] = [];
  selectedFilters = Filtertags.selectedFilters;
  filters = Filtertags.filters;
  tageAuswahl = Filtertags.tageAuswahl;
  genresTag = Filtertags.genresTag;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;
  flags = Filtertags.flags;
  behindertenTags = Filtertags.behindertenTags;
  errorMessage: string = '';
  excluded = [
    'film_beschreibung',
    'film_cover_src',
    'film_favored',
    'filminfo_href',
    'film_system_id',
    'system_id',
  ];

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
  ) {
    KeyboardResize.None;
  }

  async ngOnInit() {
    this.isLoading = true;
    await this.loadFilmData();
    this.isLoading = false;
    await this.onTimeChange();
    // Set default selected value for tageAuswahl
    this.selectedFilters.tageAuswahl = this.tageAuswahl[0].id;
    // Set default selected value for leinwandHighlights
    this.selectedFilters.leinwandHighlights = this.leinwandHighlights[0].id;
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadFilmData();
      event.target.complete();
    }, 100);
  }

  async presentActionSheet() {
    const buttons = [];

    if (!this.detailView[0]) {
      buttons.push({
        text: 'Detailübersicht',
        handler: () => {
          this.detailView[0] = true;
          this.detailView[1] = false;
          this.detailView[2] = false;
        },
      });
    }

    if (!this.detailView[1]) {
      buttons.push({
        text: 'Kurzübersicht',
        handler: () => {
          this.detailView[0] = false;
          this.detailView[1] = true;
          this.detailView[2] = false;
        },
      });
    }

    if (!this.detailView[2]) {
      buttons.push({
        text: 'Miniübersicht',
        handler: () => {
          this.detailView[0] = false;
          this.detailView[1] = false;
          this.detailView[2] = true;
        },
      });
    }

    buttons.push({
      text: 'Abbrechen',
      role: 'cancel',
    });

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'View auswählen',
      buttons: buttons,
    });

    await actionSheet.present();
  }

  async showNoMoviesPopup() {
    const alert = await this.alertController.create({
      header: 'Keine Filme gefunden',
      message: 'Mit den ausgewählten Filtern sind keine Filme verfügbar',
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            // Handle close action if needed
          },
        },
        {
          text: 'Reset Filters',
          handler: () => {
            this.reset(); // Call the reset function when "Reset Filters" is clicked
          },
        },
      ],
    });

    await alert.present();
  }

  openTimes(index: number) {
    this.isTimesOpen[index] = !this.isTimesOpen[index];
    if (this.isTimesOpen[index]) {
      setTimeout(() => {
        this.scrollToGrid(index);
      }, 300); // Adjust the delay as needed to ensure the grid is rendered before scrolling
    }
  }

  openModal() {
    const modal = document.querySelector(
      '#ticketreservation'
    ) as HTMLIonModalElement;
    modal!.present();
  }

  openSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.searchInput.focusInput();
    } else {
      this.searchInput.blurInput();
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  showTags(index: number) {
    this.showAllTags[index] = !this.showAllTags[index];
  }

  async openExternalWebsite(url: string) {
    const options = {
      toolbarColor: '#1d979f', // Customize the browser toolbar color
    };
    const finishedUrl = 'https://cinecitta.' + url;

    try {
      await Browser.open({
        url: finishedUrl,
        windowName: '_self',
        toolbarColor: options.toolbarColor,
      });
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }

  openStartTimePicker() {
    this.showStartTimePicker = !this.showStartTimePicker;
  }

  openEndTimePicker() {
    this.showEndTimePicker = !this.showEndTimePicker;
  }

  async confirm() {
    this.isLoading = true;
    await this.loadFilmData();
    this.isLoading = false;
    this.showAllTags = this.showAllTags.map((_) => false);
    this.setOpen(false);

    if (this.films.length === 0) {
      await this.showNoMoviesPopup();
    }
  }

  closeTimes() {
    this.showStartTimePicker = false;
    this.showEndTimePicker = false;
  }

  cancel() {
    this.showAllTags = Array(this.filters.length).fill(false);
    this.showAllTags = this.showAllTags.map((_) => false);
    this.setOpen(false);
  }

  async reset() {
    // Reset selected filters
    this.selectedFilters.genresTags = [];
    this.selectedFilters.leinwandHighlights = 171984;
    this.selectedFilters.tageAuswahl = '';
    this.selectedFilters.extras = [];
    this.selectedFilters.flags = [];
    this.selectedFilters.behindertenTags = [];
    this.startTime = '10:00';
    this.endTime = '03:00';

    // Reset background color of tags
    this.showAllTags = this.showAllTags.map((_) => false);
    this.closeTimes();

    this.isLoading = true;
    await this.loadFilmData();
    this.isLoading = false;
  }

  hasScreenings(theater: any): boolean {
    for (const leinwand of theater.leinwaende) {
      if (leinwand.vorstellungen) {
        return true;
      }
    }
    return false;
  }

  hasFlagName(leinwand: any, name: string): boolean {
    return leinwand.release_flags.some((flag: any) => flag.flag_name === name);
  }

  getColor(belegung_ampel: string): string {
    switch (belegung_ampel) {
      case 'gelb':
        return '#fc0';
      case 'orange':
        return '#f60';
      case 'rot':
        return '#c00';
      default:
        return ''; // If the value is not recognized, you can set a default color here
    }
  }

  async scrollToGrid(index: number) {
    const gridElement: HTMLElement | null = document.querySelector(
      `#gridRef-${index}`
    );
    if (gridElement) {
      const scrollElement: HTMLElement = await this.content.getScrollElement();
      const contentHeight = scrollElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const gridOffsetTop = gridElement.offsetTop;
      const gridHeight = gridElement.offsetHeight;

      let scrollPosition;
      if (gridHeight > windowHeight) {
        scrollPosition = gridOffsetTop;
      } else {
        scrollPosition = gridOffsetTop - (windowHeight - gridHeight) / 2;
        const maxScrollPosition = contentHeight - windowHeight;
        scrollPosition = Math.max(
          0,
          Math.min(scrollPosition, maxScrollPosition)
        );
      }

      this.content.scrollToPoint(0, scrollPosition, 500); // Adjust the duration (ms) as needed
    }
  }

  async loadFilmData() {
    try {
      const response: any = await this.fetchFilmData();
      this.films = response?.daten?.items ?? [];
      this.filteredFilms = this.films;
      localStorage.setItem('filmsData', JSON.stringify(this.films));
    } catch (error) {
      console.error(error);
    }
  }

  async fetchFilmData() {
    const url = 'https://proxy-server-rho-pearl.vercel.app/api/server';

    // Create a FormData object
    const formData = new FormData();

    // Append selected filters to the form data
    this.appendSelectedFiltersToFormData(formData);

    const params = {
      bereich: 'portal',
      modul_id: '101',
      klasse: 'vorstellungen',
      cli_mode: '1',
      com: 'anzeigen_spielplan',
    };

    try {
      // Append the params as URL parameters
      const fullURL = `${url}?${new URLSearchParams(params).toString()}`;

      const formBody = this.formDataToUrlEncoded(formData); // Convert FormData to URL-encoded string

      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        // Handle HTTP errors
        console.error('HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP Error: ${response.status}`);
      }
    } catch (error) {
      // Handle any other errors
      console.error('An error occurred:', error);
      throw error;
    }
  }

  formDataToUrlEncoded(formData: any) {
    const formBody = [];
    for (let pair of formData.entries()) {
      const encodedKey = encodeURIComponent(pair[0]);
      const encodedValue = encodeURIComponent(pair[1]);
      formBody.push(`${encodedKey}=${encodedValue}`);
    }
    return formBody.join('&');
  }

  appendSelectedFiltersToFormData(formData: FormData): void {
    formData.append('get_filter_aktiv', 'false');
    formData.append('filter[ovfilme]', '0');

    // Append selected filters to the form data
    this.selectedFilters.genresTags.forEach((id: number) =>
      formData.append('filter[genres_tags][]', id.toString())
    );
    if (this.selectedFilters.leinwandHighlights.length > 0) {
      formData.append(
        'filter[leinwand_highlight]',
        this.selectedFilters.leinwandHighlights[0].toString()
      );
    }
    if (this.selectedFilters.tageAuswahl.length > 0) {
      formData.append(
        'filter[tage_auswahl]',
        this.selectedFilters.tageAuswahl[0]
      );
    }
    this.selectedFilters.extras.forEach((extra: string) =>
      formData.append('filter[extra][]', extra)
    );
    this.selectedFilters.flags.forEach((id: number) =>
      formData.append('filter[releasetypen_flags][]', id.toString())
    );
    this.selectedFilters.behindertenTags.forEach((id: number) =>
      formData.append('filter[barrierefrei_tags][]', id.toString())
    );

    const startTimeNumeric = this.convertTimeToNumeric(this.startTime);
    const endTimeNumeric = this.convertTimeToNumeric(this.endTime);
    formData.append('filter[rangeslider][]', String(startTimeNumeric));
    formData.append('filter[rangeslider][]', String(endTimeNumeric));
  }

  async toggleSelection(id: any, filterType: string) {
    if (filterType === 'leinwandHighlights' || filterType === 'tageAuswahl') {
      // For Kinosaal tag or other non-time filters
      this.selectedFilters[filterType] = [id];
    } else {
      // For other time-related filters (if any)
      const index = this.selectedFilters[filterType].indexOf(id);
      if (index > -1) {
        // Remove the id if already selected
        this.selectedFilters[filterType].splice(index, 1);
      } else {
        // Add the id if not selected
        this.selectedFilters[filterType].push(id);
      }
    }
    this.isLoading = true;
    await this.loadFilmData();
    this.isLoading = false;
  }

  isSelected(id: any, filterType: string): boolean {
    if (filterType === 'leinwandHighlights') {
      // For Kinosaal tag
      return (
        this.selectedFilters[filterType].includes(id) ||
        (this.selectedFilters[filterType].length === 0 && id === 171984)
      );
    } else if (filterType === 'tageAuswahl') {
      // For tageAuswahl tag
      return (
        this.selectedFilters[filterType].includes(id) ||
        (this.selectedFilters[filterType].length === 0 && id === '')
      );
    } else {
      // For other tags
      return this.selectedFilters[filterType].includes(id);
    }
  }

  async onTimeChange() {
    let startHour = this.convertTimeToNumeric(this.startTime);
    let endHour = this.convertTimeToNumeric(this.endTime);
    const formatHour = (hour: number) => hour.toString().padStart(2, '0');
    this.formattedEndTime = `${formatHour(endHour)}:00`;

    // Ensure endHour is always at least one hour higher than startHour
    if (endHour <= startHour) {
      endHour = startHour + 1;

      if (endHour > 23) {
        endHour -= 24;
      }
      if (startHour > 23) {
        startHour -= 24;
      }
      this.endTime = `${formatHour(endHour)}:00`;
      this.startTime = `${formatHour(startHour)}:00`;
    }
    await this.loadFilmData();
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
