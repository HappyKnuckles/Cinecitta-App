import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { firstValueFrom } from 'rxjs';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-tab2',
  templateUrl: 'filmoverview.page.html',
  styleUrls: ['filmoverview.page.scss']
})
export class FilmOverviewPage {
  @ViewChild(IonModal) modal!: IonModal;

  selectedSeats: any[] = [];
  totalPrice: number = 0;
  message: string = '';

  isOpen: boolean = false;
  constructor(private toastController: ToastController) { }

  openTimes() {
    this.isOpen = !this.isOpen;
  }

  openModal() {
    const modal = document.querySelector('ion-modal');
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
      this.selectedSeats = this.selectedSeats.filter(seat => seat !== seatIndex);
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
      position: 'bottom'
    });
    await toast.present();
  }
}
