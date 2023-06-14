import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonContent, IonGrid, IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Subject, Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab2',
  templateUrl: 'filmoverview.page.html',
  styleUrls: ['filmoverview.page.scss'],
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
  detailView: boolean = true;
  showFull: boolean[] = [];
  searchQuery = '';
  filteredFilms: any[] = [];
  private searchSubject: Subject<string> = new Subject<string>();
  sub: Subscription = new Subscription;

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


  // scrollToGrid(index: number) {
  //   const gridElement = document.getElementById(`gridRef-${index}`);
  //   if (gridElement) {
  //     const gridOffsetTop = gridElement.offsetTop;
  //     const gridHeight = gridElement.offsetHeight;
  //     const windowHeight = window.innerHeight;
  //     const scrollPosition = gridOffsetTop - (windowHeight - gridHeight) / 2;

  //     this.content.scrollToPoint(0, scrollPosition, 500); // Adjust the duration (ms) as needed
  //   }
  // }


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
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  async loadFilmData() {
    // Check if the films data is already stored
    const storedFilmsData = localStorage.getItem('filmsData');
    if (storedFilmsData) {
      // Use the stored data instead of making a request
      this.films = JSON.parse(storedFilmsData);
      await this.updateFilteredFilms();
      console.log(this.films);
      return; // Exit the function since data is already available
    }

    // Films data is not stored, make the request
    const url =
      'http://localhost:8080/https://www.cinecitta.de/common/ajax.php?bereich=portal&modul_id=101&klasse=vorstellungen&cli_mode=1&com=anzeigen_spielplan';
    try {
      const response: any = await firstValueFrom(this.http.post(url, null));
      const filmsData = response?.daten?.items ?? [];
      this.films = filmsData;
      await this.updateFilteredFilms();
      console.log(this.films);

      // Store the films data in local storage for future use
      localStorage.setItem('filmsData', JSON.stringify(filmsData));
    } catch (error) {
      console.error(error);
    }
  }

  onSearchChange(searchValue: string) {
    this.searchQuery = searchValue.trim().toLowerCase();
    this.searchSubject.next(this.searchQuery);
    // If you want to immediately update the filtered films without debounce, uncomment the following line
    // this.updateFilteredFilms();
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

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.selectedSeats, 'confirm');
  }

  toggleSeatSelection(seatIndex: number) {
    if (this.selectedSeats.includes(seatIndex)) {
      this.selectedSeats = this.selectedSeats.filter(
        (seat) => seat !== seatIndex
      );
    } else {
      this.selectedSeats.push(seatIndex);
    }
  }
  async onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<any[]>>;
    if (ev.detail.role === 'confirm') {
      const seats = ev.detail.data;
      const seatPrice = 9;
      const totalPrice = seats!.length * seatPrice;

      const message = `Anzahl Plätze: ${seats!.length}\nPreis: ${totalPrice}€`;
      await this.showToast(message);
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
    });
    await toast.present();
  }
}


/************************************************************************************************************************************************************/
/************************************************************************************************************************************************************/
/***************  The following Part contains Logic used for filtering films in realtime on the server side, this will be used in production  ***************/
/************************************************************************************************************************************************************/
/************************************************************************************************************************************************************/
/************************************************************************************************************************************************************/



// async ngOnInit(
//   this.sub = this.searchSubject
//     .pipe(debounceTime(700))
//     .subscribe(() => {
//       this.loadFilmData();
//     });
//  )


// const tage_auswahl = empty, tage_auswahl-heute, tage_auswahl-morgen, tage_auswahl-amwe, tage_auswahl-naechstewoche, tage_auswahl-weiterenwochen
// const genres_tag = 165060(Action), 165087(Animation), 165579(Dokumentation), 165122(Drama), 165088(Family), 165058(Fantasy), 165110(Horror), 165033(Komödie), 165137(Romance), 165059(Science Fiction), 165156(Thriller), 262715(Anime), 843164(Arthouse), 
// const leinwand_highlights = 171984(Alle Kinos), 168943(CINECITTA), 1039(Deluxe), 1040(Cinemagnum), 185228(Open Air), 121383(Meisengeige), 122646(Metropolis), 548180(Manhatten), 1053804(Onyx LED)
// const extras = neustarts, vorverkauf
// const flags = 104836(ATMOS), 104831(3D), 104831(OV), 104838(mit Untertitel), 631455(D-BOX)
// const behinderten_tags = 1(Hörverstärkung), 2(Audiodeskription), 3(Untertitel für Hörgeschädigte)

//  async loadFilmData() {
//     Check if the films data is already stored
//   const storedFilmsData = localStorage.getItem('filmsData');
//   if (storedFilmsData) {
//     // Use the stored data instead of making a request
//     this.films = JSON.parse(storedFilmsData);
//     await this.updateFilteredFilms();
//     console.log(this.films);
//     return; // Exit the function since data is already available
//   }

//   // Films data is not stored, make the request
//   const url =
//     'http://localhost:8080/https://www.cinecitta.de/common/ajax.php';
//   const params = {
//     bereich: 'portal',
//     modul_id: '101',
//     klasse: 'vorstellungen',
//     cli_mode: '1',
//     com: 'anzeigen_spielplan',
//   };
//   const formData = new FormData()
//   formData.append('get_filter_aktiv', 'false');
//   formData.append('filter[ovfilme]', '0')
//   formData.append('filter[stichwort]', this.searchQuery);
//   formData.append('filter[barrierefrei_tags][]', 'behinderten_tags')
//   formData.append('filter[genres_tags][]', 'genres_tag')
//   formData.append('filter[extra][]', 'extras')
//   formData.append('filter[leinwand_highlight]', 'leinwand_highlights')
//   formData.append('filter[rangeslide][]', 'Zeit eins')
//   formData.append('filter[rangeslide][]', 'Zeit zwei')
//   formData.append('filter[tage_auswahl]', 'tage_auswahl')
//   formData.append('filter[releasetypen_flags][]', 'flags')

//   try {
//     const response: any = await firstValueFrom(this.http.post(url, formData, { params }));
//     console.log(response); // Log the response to inspect its structure
//     const filmsData = response?.daten?.items ?? [];
//     this.films = filmsData;
//     await this.updateFilteredFilms();
//     console.log(this.films);

//     // Store the films data in local storage for future use
//     localStorage.setItem('filmsData', JSON.stringify(filmsData));
//   } catch (error) {
//     console.error(error);
//   }
// }

// onSearchChange(searchValue: string) {
//   this.searchQuery = searchValue.trim().toLowerCase();
//   this.searchSubject.next(this.searchQuery);
// }