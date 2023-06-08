import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { IonContent, IonGrid, IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { firstValueFrom } from 'rxjs';
import { ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab2',
  templateUrl: 'filmoverview.page.html',
  styleUrls: ['filmoverview.page.scss'],
})
export class FilmOverviewPage {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild(IonContent, { static: false }) content!: IonContent;
   films: any[] = [];
  selectedSeats: any[] = [];
  totalPrice: number = 0;
  message: string = '';
  isOpen: boolean[] = [];

  constructor(
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  openTimes(index: number) {
    this.isOpen[index] = !this.isOpen[index];
    if (this.isOpen[index]) {
      setTimeout(() => {
        this.scrollToGrid(index);
      }, 300); // Adjust the delay as needed to ensure the grid is rendered before scrolling
    }
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
  }

  async loadFilmData() {
    // Check if the films data is already stored
    const storedFilmsData = localStorage.getItem('filmsData');
    if (storedFilmsData) {
      // Use the stored data instead of making a request
      this.films = JSON.parse(storedFilmsData);
      console.log(this.films);
      return; // Exit the function since data is already available
    }

    // Films data is not stored, make the request
    const url =
      'http://localhost:8080/https://www.cinecitta.de/common/ajax.php?bereich=portal&modul_id=101&klasse=vorstellungen&cli_mode=1&com=anzeigen_spielplan';
    try {
      const response: any = await firstValueFrom(this.http.post(url, null));
      console.log(response); // Log the response to inspect its structure
      const filmsData = response?.daten?.items ?? [];
      this.films = filmsData;
      console.log(this.films);

      // Store the films data in local storage for future use
      localStorage.setItem('filmsData', JSON.stringify(filmsData));
    } catch (error) {
      console.error(error);
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
