import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  IonContent,
  IonModal,
  IonBackdrop,
  IonText,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  IonTitle,
  IonButtons,
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
  IonSkeletonText, IonRefresherContent
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { ImpactStyle } from '@capacitor/haptics';
import { Network } from '@capacitor/network';
import { NgIf, NgFor, NgStyle, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { addIcons } from 'ionicons';
import { ellipsisVertical, search, chevronBack, chevronUp, chevronDown, removeOutline, informationCircleOutline } from 'ionicons/icons';
import { Film, Theater, Leinwand } from 'src/app/core/models/filmModel';
import { ViewType } from 'src/app/core/models/viewEnum';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { OpenWebsiteService } from 'src/app/core/services/website/open-website.service';
import { FilmStateService } from 'src/app/core/services/film-state/film-state.service';
import { UIStateService } from 'src/app/core/services/ui-state/ui-state.service';
import { SearchComponent } from 'src/app/shared/components/search/search.component';
import { ExtractTextPipe } from 'src/app/shared/pipes/extract-text/extract-text.pipe';
import { TransformTimePipe } from 'src/app/shared/pipes/time-transformer/transform-time.pipe';
import * as Filtertags from 'src/app/core/models/filtertags';
@Component({
  selector: 'app-filmoverview',
  templateUrl: 'filmoverview.page.html',
  styleUrls: ['filmoverview.page.scss'],
  standalone: true,
  imports: [IonRefresherContent,
    IonSkeletonText,
    NgIf,
    IonBackdrop,
    IonText,
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    IonTitle,
    SearchComponent,
    IonModal,
    IonButtons,
    IonContent,
    IonGrid,
    NgFor,
    IonRow,
    IonCol,
    IonSelect,
    FormsModule,
    IonSelectOption,
    IonLabel,
    NgStyle,
    NgClass,
    IonDatetime,
    IonFooter,
    IonRefresher,
    IonImg,
    IonPopover,
    ExtractTextPipe,
    TransformTimePipe,
  ],
})
export class FilmOverviewPage implements OnInit, OnDestroy {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild(SearchComponent, { static: false }) searchInput!: SearchComponent;
  
  formData: FormData = new FormData();
  startTime = '10:00';
  endTime = '03:00';
  formattedEndTime = '';
  message = '';
  isReload = false;
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
  private debounceTimeout: any;
  intervalId: any;

  // Computed properties from services
  films = this.filmStateService.filteredFilms;
  isSearchOpen = this.uiStateService.isSearchOpen;
  isModalOpen = this.uiStateService.isModalOpen;
  detailView = this.uiStateService.detailView;
  showStartTimePicker = this.uiStateService.showStartTimePicker;
  showEndTimePicker = this.uiStateService.showEndTimePicker;
  showFull = this.uiStateService.showFull;
  showAllTags = this.uiStateService.showAllTags;
  showTrailer = this.uiStateService.showTrailer;
  isTimesOpen = this.uiStateService.isTimesOpen;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private alertController: AlertController,
    private website: OpenWebsiteService,
    public loadingService: LoadingService,
    private toastService: ToastService,
    private hapticService: HapticService,
    private route: ActivatedRoute,
    private filmStateService: FilmStateService,
    public uiStateService: UIStateService
  ) {
    addIcons({
      ellipsisVertical,
      search,
      chevronBack,
      chevronUp,
      chevronDown,
      removeOutline,
      informationCircleOutline,
    });
   
  }

  async ngOnInit(): Promise<void> {
    this.setDefaultSelectedFilterValues();
    await this.onTimeChange(true);
    
    // Load initial film data
    await this.loadFilmData();
    
    this.checkTimes();
    this.startPeriodicCheck();
 
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.uiStateService.setSearchOpen(true);
      }
    }
    );
  }

  startPeriodicCheck() {
    this.intervalId = setInterval(() => {
      this.checkTimes();
    }, 60000); // Check every minute
  }

  // TODO make more efficient maybe sort films before checking times or map films to a dictionary
  checkTimes() {
    const now = new Date();
    const films = this.films();

    films.forEach((film) => {
      film.theater.forEach((theater) => {
        theater.leinwaende.forEach((leinwand) => {
          leinwand.vorstellungen.forEach((vorstellung) => {
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
  //           filmMap.set(vorstellung.href!, { film, theater, leinwand, vorstellung, vorstellungTime });
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
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private setDefaultSelectedFilterValues(): void {
    this.selectedFilters.tageAuswahl = this.tageAuswahl[0].id;
    this.selectedFilters.leinwandHighlights = this.leinwandHighlights[0].id;
  }

  handleRefresh(event: any): void {
    this.hapticService.vibrate(ImpactStyle.Medium, 200);
    setTimeout(() => {
      this.isReload = true;
      this.loadFilmData().then(() => {
        this.searchInput.clearInput();
        event.target.complete();
      });
    }, 100);
  }

  async presentActionSheet(): Promise<void> {
    const buttons = [];
    this.hapticService.vibrate(ImpactStyle.Medium, 200);
    const detailView = this.detailView();
    
    if (!detailView[0]) {
      buttons.push({
        text: ViewType.Detail,
        handler: () => {
          this.uiStateService.setDetailView(0);
        },
      });
    }

    if (!detailView[1]) {
      buttons.push({
        text: ViewType.Kurz,
        handler: () => {
          this.uiStateService.setDetailView(1);
        },
      });
    }

    if (!detailView[2]) {
      buttons.push({
        text: ViewType.Mini,
        handler: () => {
          this.uiStateService.setDetailView(2);
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
    this.hapticService.vibrate(ImpactStyle.Heavy, 300);
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
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    const currentState = this.isTimesOpen();
    this.uiStateService.setTimesOpen(film_id, !currentState[film_id]);
    if (!currentState[film_id]) {
      setTimeout(() => {
        this.scrollToGrid(index);
      }, 300);
    }
  }

  openSearch(): void {
    const isCurrentlyOpen = this.isSearchOpen();
    this.uiStateService.setSearchOpen(!isCurrentlyOpen);
    if (!isCurrentlyOpen) {
      this.searchInput.focusInput();
    } else {
      this.searchInput.blurInput();
    }
  }

  showTrailers(film: Film): void {
    if (film.trailerUrl) {
      const currentState = this.showTrailer();
      this.uiStateService.setShowTrailer(film.system_id, !currentState[film.system_id]);
    } else {
      this.toastService.showToast(`Kein Trailer für ${film.film_titel} verfügbar`, 'bug', true);
    }
  }

  async setOpen(isOpen: boolean): Promise<void> {
    const hasInternet = (await Network.getStatus()).connected;
    if (hasInternet) {
      this.hapticService.vibrate(ImpactStyle.Medium, 200);
      this.uiStateService.setModalOpen(isOpen);
    } else {
      this.toastService.showToast("Can't use filters. No internet connection.", 'alert-outline', true);
    }
  }

  showTags(index: number): void {
    const currentState = this.showAllTags();
    this.uiStateService.setShowAllTags(index, !currentState[index]);
  }

  async openExternalWebsite(url: string): Promise<void> {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }

  openStartTimePicker(): void {
    const current = this.showStartTimePicker();
    this.uiStateService.setShowStartTimePicker(!current);
  }

  openEndTimePicker(): void {
    const current = this.showEndTimePicker();
    this.uiStateService.setShowEndTimePicker(!current);
  }

  async confirm(): Promise<void> {
    // Reset all tags to collapsed state
    const showAllTagsArray = this.showAllTags();
    for (let i = 0; i < showAllTagsArray.length; i++) {
      this.uiStateService.setShowAllTags(i, false);
    }
    this.setOpen(false);

    if (this.films().length === 0) {
      await this.showNoMoviesPopup();
    }
  }

  closeTimes(): void {
    this.uiStateService.setShowStartTimePicker(false);
    this.uiStateService.setShowEndTimePicker(false);
  }

  cancel(): void {
    // Reset all tags to collapsed state
    for (let i = 0; i < this.filters.length; i++) {
      this.uiStateService.setShowAllTags(i, false);
    }
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
    for (let i = 0; i < this.filters.length; i++) {
      this.uiStateService.setShowAllTags(i, false);
    }
    this.closeTimes();

    await this.loadFilmData();
  }

  hasScreenings(film: Film): boolean {
    return film.theater.some((theater) => this.hasScreeningsForTheater(theater));
  }

  hasScreeningsForTheater(theater: Theater): boolean {
    return theater.leinwaende.some((leinwand) => this.hasScreeningsForLeinwand(leinwand));
  }

  hasScreeningsForLeinwand(leinwand: Leinwand): boolean {
    return leinwand.vorstellungen?.some((vorstellung) => this.isWithinTimeRange(vorstellung.uhrzeit)) ?? false;
  }

  isWithinTimeRange(uhrzeit: string): boolean {
    return this.startTime <= uhrzeit && this.formattedEndTime >= uhrzeit;
  }

  hasFlagName(leinwand: Leinwand, name: string): boolean {
    return leinwand.release_flags.some((flag: { flag_name: string }) => flag.flag_name === name);
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
    const gridElement: HTMLElement | null = document.querySelector(`#gridRef-${index}`);
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
        scrollPosition = Math.max(0, Math.min(scrollPosition, maxScrollPosition));
      }

      this.content.scrollToPoint(0, scrollPosition, 500);
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async loadFilmData(): Promise<void> {
    this.formData = this.appendSelectedFiltersToFormData();
    // Load films into the centralized state service
    await this.filmStateService.loadFilms(this.formData, this.isReload, this.excluded);
  }

  appendSelectedFiltersToFormData(): FormData {
    const formData = new FormData();

    formData.append('get_filter_aktiv', 'false');
    formData.append('filter[ovfilme]', '0');

    // Append selected filters to the form data
    this.selectedFilters.genresTags.forEach((id: number) => formData.append('filter[genres_tags][]', id.toString()));
    if (this.selectedFilters.leinwandHighlights.length > 0) {
      formData.append('filter[leinwand_highlight]', this.selectedFilters.leinwandHighlights[0].toString());
    }
    if (this.selectedFilters.tageAuswahl.length > 0) {
      formData.append('filter[tage_auswahl]', this.selectedFilters.tageAuswahl[0]);
    }
    this.selectedFilters.extras.forEach((extra: string) => formData.append('filter[extra][]', extra));
    this.selectedFilters.flags.forEach((id: number) => formData.append('filter[releasetypen_flags][]', id.toString()));
    this.selectedFilters.behindertenTags.forEach((id: number) => formData.append('filter[barrierefrei_tags][]', id.toString()));

    const startTimeNumeric = this.convertTimeToNumeric(this.startTime);
    const endTimeNumeric = this.convertTimeToNumeric(this.endTime);
    formData.append('filter[rangeslider][]', String(startTimeNumeric));
    formData.append('filter[rangeslider][]', String(endTimeNumeric));

    return formData;
  }

  async toggleSelection(id: any, filterType: string): Promise<void> {
    this.isReload = false;
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
      return this.selectedFilters[filterType].includes(id) || (this.selectedFilters[filterType].length === 0 && id === 171984);
    } else if (filterType === 'tageAuswahl') {
      // For tageAuswahl tag
      return this.selectedFilters[filterType].includes(id) || (this.selectedFilters[filterType].length === 0 && id === '');
    } else {
      // For other tags
      return this.selectedFilters[filterType].includes(id);
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async onTimeChange(isInit?: boolean): Promise<void> {
    this.isReload = false;
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

    // Debounce loadFilmData
    if (!isInit) {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this.debounceTimeout = setTimeout(async () => {
        await this.loadFilmData();
      }, 300); // Adjust the debounce delay as needed (300ms in this example)
    }
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
