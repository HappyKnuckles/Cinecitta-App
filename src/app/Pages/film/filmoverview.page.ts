import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonContent, IonGrid, IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Subject, Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { animate, state, style, transition, trigger } from '@angular/animations';


@Component({
  selector: 'app-tab2',
  templateUrl: 'filmoverview.page.html',
  styleUrls: ['filmoverview.page.scss'],
  animations: [
    trigger('openClose', [
      state('true', style({ opacity: 0, 'font-size': '0', height: '0' })),
      state('false', style({ opacity: 1, 'font-size': '*', height: '*' })),
      transition('false <=> true', [
        animate('400ms ease-in-out')
      ])
    ])
  ]
})
export class FilmOverviewPage implements OnInit, OnDestroy {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;
  films: any[] = [];
  selectedSeats: any[] = [];
  totalPrice: number = 0;
  message: string = '';
  isOpen: boolean[] = [];
  isSearchOpen: boolean = false;
  isModalOpen: boolean = false;
  detailView: boolean = true;
  showFull: boolean[] = [];
  showAllTags: boolean[] = [];
  searchQuery = '';
  filteredFilms: any[] = [];
  private searchSubject: Subject<string> = new Subject<string>();
  sub: Subscription = new Subscription;
  selectedFilters: any = {
    genresTags: [],
    tageAuswahl: [],
    leinwandHighlights: [],
    extras: [],
    flags: [],
    behindertenTags: []
  };

  filters = ['Zeitraum', 'Genre', 'Kinosaal', 'Sound', 'Barrierefreie Optionen']

  tageAuswahl = [
    { id: '', name: 'Diese Woche' },
    { id: 'tage_auswahl-heute', name: 'Heute' },
    { id: 'tage_auswahl-morgen', name: 'Morgen' },
    { id: 'tage_auswahl-amwe', name: 'Am Wochenende' },
    { id: 'tage_auswahl-naechstewoche', name: 'nächste Woche' },
    { id: 'tage_auswahl-weiterenwochen', name: 'alle weiteren Wochen' },
  ];

  genresTag = [
    { id: 165060, name: 'Action' },
    { id: 165087, name: 'Animation' },
    { id: 165579, name: 'Dokumentation' },
    { id: 165122, name: 'Drama' },
    { id: 165088, name: 'Family' },
    { id: 165058, name: 'Fantasy' },
    { id: 165110, name: 'Horror' },
    { id: 165033, name: 'Komödie' },
    { id: 165137, name: 'Romance' },
    { id: 165059, name: 'Science Fiction' },
    { id: 165156, name: 'Thriller' },
    { id: 262715, name: 'Anime' },
    { id: 843164, name: 'Arthouse' }
  ];

  leinwandHighlights = [
    { id: 171984, name: 'Alle Kinos' },
    { id: 168943, name: 'CINECITTA' },
    { id: 1039, name: 'Deluxe' },
    { id: 1040, name: 'Cinemagnum' },
    { id: 185228, name: 'Open Air' },
    { id: 121383, name: 'Meisengeige' },
    { id: 122646, name: 'Metropolis' },
    { id: 548180, name: 'Manhatten' },
    { id: 1053804, name: 'Onyx LED' }
  ];
  customActionSheetOptions = {
    header: 'Colors',
    subHeader: 'Select your favorite color',
  };
  extras = ['neustarts', 'vorverkauf'];

  flags = [
    { id: 104836, name: 'ATMOS' },
    { id: 104831, name: '3D' },
    { id: 104837, name: 'OV' },
    { id: 104838, name: 'mit Untertitel' },
    { id: 631455, name: 'D-BOX' }
  ];

  behindertenTags = [
    { id: 1, name: 'Hörverstärkung' },
    { id: 2, name: 'Audiodeskription' },
    { id: 3, name: 'Untertitel für Hörgeschädigte' }
  ];

  constructor(
    private toastController: ToastController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController
  ) { }

  openTimes(index: number) {
    this.isOpen[index] = !this.isOpen[index];
    if (this.isOpen[index]) {
      setTimeout(() => {
        this.scrollToGrid(index);
      }, 300); // Adjust the delay as needed to ensure the grid is rendered before scrolling
    }
  }

  openSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }

  showTags(index: number) {
    this.showAllTags[index] = !this.showAllTags[index];
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'View auswählen',
      buttons: [
        {
          text: this.detailView ? 'Kurzübersicht' : 'Detailübersicht',
          handler: () => {
            this.detailView = !this.detailView;
          }
        },
        {
          text: 'Abbrechen',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  hasFlagName(leinwand: any, name: string): boolean {
    return leinwand.release_flags.some((flag: any) => flag.flag_name === name);
  }

  async scrollToGrid(index: number) {
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

      this.content.scrollToPoint(0, scrollPosition, 500); // Adjust the duration (ms) as needed
    }
  }

  async ngOnInit() {
    await this.loadFilmData();
    this.sub = this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.updateFilteredFilms();
    });
    // Set default selected value for tageAuswahl
    this.selectedFilters.tageAuswahl = this.tageAuswahl[0].id;
    // Set default selected value for leinwandHighlights
    this.selectedFilters.leinwandHighlights = this.leinwandHighlights[0].id;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async loadFilmData() {
    // Check if the films data is already stored
    // const storedFilmsData = localStorage.getItem('filmsData');
    // if (storedFilmsData) {
    //   // Use the stored data instead of making a request
    //   this.films = JSON.parse(storedFilmsData);
    //   await this.updateFilteredFilms();
    //   console.log(this.films);
    //   return; // Exit the function since data is already available
    // }

    const url = 'http://localhost:8080/https://www.cinecitta.de/common/ajax.php';
    const params = {
      bereich: 'portal',
      modul_id: '101',
      klasse: 'vorstellungen',
      cli_mode: '1',
      com: 'anzeigen_spielplan',
    };

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

    // formData.append('filter[rangeslide][]', 'Zeit eins');
    // formData.append('filter[rangeslide][]', 'Zeit zwei');

    try {
      const response: any = await firstValueFrom(this.http.post(url, formData, { params }));
      console.log(response); // Log the response to inspect its structure
      const filmsData = response?.daten?.items ?? [];
      this.films = filmsData;
      this.filteredFilms = this.films;
      await this.updateFilteredFilms();
      // console.log(this.filteredFilms);
      localStorage.setItem('filmsData', JSON.stringify(filmsData));


    } catch (error) {
      console.error(error);
    }
  }

  onSearchChange(searchValue: string) {
    this.searchQuery = searchValue.trim().toLowerCase();
    this.searchSubject.next(this.searchQuery);
  }

  async updateFilteredFilms() {
    const excludedProperties = ['film_beschreibung', 'film_cover_src', 'film_favored', 'filminfo_href', 'film_system_id', 'system_id']; // Add more property names as needed
    if (this.searchQuery) {
      this.filteredFilms = this.films.filter(film =>
        Object.entries(film).some(([key, value]) => {
          if (excludedProperties.includes(key)) {
            return false; // Exclude the property from filtering
          }
          return value && value.toString().toLowerCase().includes(this.searchQuery);
        })
      );
    } else {
      this.filteredFilms = this.films;
    }
  }

  openModal() {
    const modal = document.querySelector(
      '#ticketreservation'
    ) as HTMLIonModalElement;
    modal!.present();
  }

  async toggleSelection(id: any, filterType: string) {
    if (filterType === 'leinwandHighlights' || filterType === 'tageAuswahl') {
      // For Kinosaal tag
      this.selectedFilters[filterType] = [id];
    } else {
      // For other tags
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

  async cancel() {
    this.showAllTags = Array(this.filters.length).fill(false);
    this.showAllTags = this.showAllTags.map(_ => false);
    this.setOpen(false);
  }

  async confirm() {
    await this.loadFilmData();
    this.showAllTags = this.showAllTags.map(_ => false);
    this.setOpen(false);
  }

  reset() {
    // Store the current selection of the tag with ID 171984
    const isSelected171984 = this.selectedFilters.leinwandHighlights.includes(171984);

    // Reset selected filters
    this.selectedFilters.genresTags = [];
    this.selectedFilters.leinwandHighlights = isSelected171984 ? [171984] : [];
    this.selectedFilters.extras = [];
    this.selectedFilters.flags = [];
    this.selectedFilters.behindertenTags = [];

    // Reset background color of tags
    this.showAllTags = this.showAllTags.map(_ => false);
  }
}