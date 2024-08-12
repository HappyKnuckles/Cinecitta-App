import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  IonContent,
  IonModal,
} from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import * as Filtertags from '../../models/filtertags';
import { SearchComponent } from 'src/app/common/search/search.component';
import { Film, Leinwand } from '../../models/filmModel';
import { ViewType } from '../../models/viewEnum';
import { OpenWebsiteService } from 'src/app/services/website/open-website.service';
import { LoadingService } from 'src/app/services/loader/loading.service';
import { Subscription, filter } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-filmoverview',
  templateUrl: 'filmoverview.page.html',
  styleUrls: ['filmoverview.page.scss']
})

export class FilmOverviewPage implements OnInit, OnDestroy {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild(SearchComponent, { static: false }) searchInput!: SearchComponent;

  showStartTimePicker = false;
  showEndTimePicker = false;
  formData: any;
  startTime = '10:00';
  endTime = '03:00';
  formattedEndTime = "";
  films: Film[] = [];
  message = '';
  isLoading = false;
  isTimesOpen: { [key: string]: boolean } = {};
  isSearchOpen = false;
  isModalOpen = false;
  detailView: boolean[] = [true, false, false];
  showFull: boolean[] = [];
  showAllTags: boolean[] = [];
  showTrailer: { [key: string]: boolean } = {};
  selectedFilters = Filtertags.selectedFilters;
  filters = Filtertags.filters;
  tageAuswahl = Filtertags.tageAuswahl;
  genresTag = Filtertags.genresTag;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;
  flags = Filtertags.flags;
  behindertenTags = Filtertags.behindertenTags;
  errorMessage = '';
  excluded = Filtertags.excludedFilmValues;
  private loadingSubscription: Subscription;
  private routerSubscription: Subscription = new Subscription();
  private debounceTimeout: any;

  intervalId: any;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
    private website: OpenWebsiteService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.loadingSubscription = this.loadingService.isLoading$.subscribe(isLoading => {
      this.isLoading = isLoading;
    });
  }

  async ngOnInit(): Promise<void> {

    // so lassen?
    this.routerSubscription.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          if (event.url.includes('/tabs/film') && this.searchInput.searchQuery !== "") {
            this.isSearchOpen = true;
          }
        })
    );
    this.setDefaultSelectedFilterValues();
    //await this.onTimeChange();
    await this.loadFilmData();
    this.startPeriodicCheck();
  }
  startPeriodicCheck() {
    this.intervalId = setInterval(() => {
      this.checkTimes();
    }, 60000); // Check every minute
  }

  // TODO make more efficient maybe sort films before checking times or map films to a dictionary
  checkTimes() {
    const now = new Date();

    this.films.forEach(film => {
      film.theater.forEach(theater => {
        theater.leinwaende.forEach(leinwand => {
          leinwand.vorstellungen.forEach(vorstellung => {
            const vorstellungTime = new Date(vorstellung.datum_uhrzeit_iso!);
            if (vorstellungTime < now && !vorstellung.deaktiviert) {
              vorstellung.deaktiviert = true;
            }
          });
        });
      });
    });

  }
  // with dictionary
  // checkTimes() {
  //   const now = new Date();
  
  //   // Flatten the structure and map films to a dictionary
  //   const filmMap = new Map<string, any>();
  //   this.films.forEach(film => {
  //     film.theater.forEach(theater => {
  //       theater.leinwaende.forEach(leinwand => {
  //         leinwand.vorstellungen.forEach(vorstellung => {
  //           const vorstellungTime = new Date(vorstellung.datum_uhrzeit_iso!);
  //           filmMap.set(vorstellung.id, { film, theater, leinwand, vorstellung, vorstellungTime });
  //         });
  //       });
  //     });
  //   });
  
  //   // Iterate through the dictionary
  //   filmMap.forEach((value, key) => {
  //     if (value.vorstellungTime <= now) {
  //       // Perform the necessary action
  //      value.vorstellung.deaktiviert = true;

  //     }
  //   });
  // }
  ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private setDefaultSelectedFilterValues(): void {
    this.selectedFilters.tageAuswahl = this.tageAuswahl[0].id;
    this.selectedFilters.leinwandHighlights = this.leinwandHighlights[0].id;
  }

  handleRefresh(event: any): void {
    setTimeout(async () => {
      await this.loadFilmData();
      this.searchInput.clearInput();
      event.target.complete();
    }, 100);
  }

  async presentActionSheet(): Promise<void> {
    const buttons = [];

    if (!this.detailView[0]) {
      buttons.push({
        text: ViewType.Detail,
        handler: () => {
          this.detailView[0] = true;
          this.detailView[1] = false;
          this.detailView[2] = false;
        },
      });
    }

    if (!this.detailView[1]) {
      buttons.push({
        text: ViewType.Kurz,
        handler: () => {
          this.detailView[0] = false;
          this.detailView[1] = true;
          this.detailView[2] = false;
        },
      });
    }

    if (!this.detailView[2]) {
      buttons.push({
        text: ViewType.Mini,
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

  async showNoMoviesPopup(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Keine Filme gefunden',
      message: 'Mit den ausgewählten Filtern sind keine Filme verfügbar',
      buttons: [
        {
          text: 'Schließen',
          role: 'cancel',
          // handler: () => {
          // },
        },
        {
          text: 'Filter löschen',
          role: 'confirm',
          handler: () => {
            this.reset();
          },
        },
      ],
    });

    await alert.present();
  }

  openTimes(film_id: string, index: number): void {
    this.isTimesOpen[film_id] = !this.isTimesOpen[film_id];
    if (this.isTimesOpen[film_id]) {
      setTimeout(() => {
        this.scrollToGrid(index);
      }, 300);
    }
  }

  openSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.searchInput.focusInput();
    } else {
      this.searchInput.blurInput();
    }
  }

  showTrailers(film: Film): void {
    if (film.trailerUrl) {
      this.showTrailer[film.system_id] = !this.showTrailer[film.system_id];
    }
  }

  setOpen(isOpen: boolean): void {
    this.isModalOpen = isOpen;
  }

  showTags(index: number): void {
    this.showAllTags[index] = !this.showAllTags[index];
  }

  async openExternalWebsite(url: string): Promise<void> {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }

  }

  openStartTimePicker(): void {
    this.showStartTimePicker = !this.showStartTimePicker;
  }

  openEndTimePicker(): void {
    this.showEndTimePicker = !this.showEndTimePicker;
  }

  async confirm(): Promise<void> {
    this.showAllTags = this.showAllTags.map((_) => false);
    this.setOpen(false);

    if (this.films.length === 0) {
      await this.showNoMoviesPopup();
    }
  }

  closeTimes(): void {
    this.showStartTimePicker = false;
    this.showEndTimePicker = false;
  }

  cancel(): void {
    this.showAllTags = Array(this.filters.length).fill(false);
    this.showAllTags = this.showAllTags.map((_) => false);
    this.setOpen(false);
  }

  async reset(): Promise<void> {
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

    await this.loadFilmData();
  }

  hasScreenings(film: Film): boolean {
    return film.theater.some(theater =>
      theater.leinwaende.some(leinwand =>
        leinwand.vorstellungen?.some(vorstellung =>
          this.startTime <= vorstellung.uhrzeit &&
          this.formattedEndTime >= vorstellung.uhrzeit
        )
      )
    );
  }

  hasScreeningsForLeinwand(leinwand: Leinwand): boolean {
    const result = leinwand.vorstellungen?.some(vorstellung => {
      const isWithinTimeRange = this.startTime <= vorstellung.uhrzeit && this.formattedEndTime >= vorstellung.uhrzeit;
      return isWithinTimeRange;
    });
    return result;
  }

  hasFlagName(leinwand: Leinwand, name: string): boolean {
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
        return '';
    }
  }

  async scrollToGrid(index: number): Promise<void> {
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

      this.content.scrollToPoint(0, scrollPosition, 500);
    }
  }

  async loadFilmData(): Promise<void> {
    this.formData = this.appendSelectedFiltersToFormData();
  }

  appendSelectedFiltersToFormData(): FormData {
    const formData = new FormData();

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

    return formData;
  }

  async toggleSelection(id: any, filterType: string): Promise<void> {
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
    await this.loadFilmData();
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

  async onTimeChange(): Promise<void> {
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
    // TODO change initial loading method (debounce time happens on startup)
    // Debounce loadFilmData
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(async () => {
      await this.loadFilmData();
    }, 300); // Adjust the debounce delay as needed (300ms in this example)
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
