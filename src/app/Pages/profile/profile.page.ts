import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { IonModal } from '@ionic/angular';
import { Subscription, firstValueFrom } from 'rxjs';
import { OpenWebsiteService } from 'src/app/services/website/open-website.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('modal1') modal1!: IonModal;
  @ViewChild('modal2') modal2!: IonModal;
  @ViewChild('modal0') modal0!: IonModal;
  username: string = '';
  password: string = '';

  manhattanFilms: any[] = [];
  cinecittaFilms: any[] = [];
  futureFilms: any[] = [];
  filmsInCurrentMonth: any[] = [];
  filmsInCurrentYear: any[] = [];
  history: any[] = [];
  currentTags = undefined;
  isOpen: boolean[] = [];

  tags = [
    {
      id: 1,
      name: 'Horror',
    },
    {
      id: 2,
      name: 'Drama',
    },
    {
      id: 3,
      name: 'Komödie',
    },
    {
      id: 4,
      name: 'Schräg',
    },
    {
      id: 5,
      name: 'FSK18',
    },
  ];

  image = 'assets/images/default-avatar.png';
  image2 = 'assets/images/hellow.png';
  sub: Subscription = new Subscription();
  isToggled: boolean = false;
  constructor(private router: Router, private http: HttpClient, private website: OpenWebsiteService,
    ) {}

  async ngOnInit() {
    await this.loadTicketHistory();
    await this.getFilmsForCurrentMonthAndYear();
    await this.getFutureFilms();
    await this.getCinecittaAndManhattanFilms();
  } 

  handleRefresh(event: any) {
    setTimeout(() => {
      this.loadTicketHistory();
      event.target.complete();
    }, 100);
  }
  
  async openExternalWebsite(url: string) {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }
  
  async login(username: string, password: string): Promise<boolean> {
    const url = 'https://proxy-server-rho-pearl.vercel.app/api/server';
    const formData = new URLSearchParams();

    const params = {
      bereich: 'portal',
      modul_id: '1',
      klasse: 'login',
      com: 'login',
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded', // Set the content type to URL-encoded
    });
    formData.append('login_kennung', username); // Use 'login_kennung' as the field name for username
    formData.append('login_passwort', password); // Use 'login_passwort' as the field name for password

    try {
      const response: any = await firstValueFrom(
        this.http.post(url, formData.toString(), {
          params: params,
          headers: headers,
          observe: 'response', // Include the response headers
        })
      );

      // Extract cookies from the response's Set-Cookie header
      const setCookieHeader = response.headers.get('set-cookie');
      console.log(setCookieHeader);
      // Save cookies in local storage
      localStorage.setItem('appCookies', setCookieHeader);

      // Perform any additional actions upon successful login
      console.log('Login successful');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getCinecittaAndManhattanFilms(){
    this.manhattanFilms = this.history.filter((ticket) => {
      return ticket.buchung_vorstellung_theater_id !== 382;
    })

    this.cinecittaFilms = this.history.filter((ticket) => {
      return ticket.buchung_vorstellung_theater_id === 382;
    })
  }

  async getFutureFilms() {
    this.futureFilms = this.history.filter((ticket) => {
      return ticket.transaktion_zeitlich !== 'vergangen';
    });
  }
  
  async getFilmsForCurrentMonthAndYear() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
    const currentYear = currentDate.getFullYear();

    this.filmsInCurrentMonth = this.history.filter((ticket) => {
      const ticketDate = new Date(ticket.buchung_vorstellung_start_datum);
      return (
        ticketDate.getMonth() + 1 === currentMonth && ticketDate.getFullYear() === currentYear
      );
    });

    this.filmsInCurrentYear = this.history.filter((ticket) => {
      const ticketDate = new Date(ticket.buchung_vorstellung_start_datum);
      return ticketDate.getFullYear() === currentYear;
    });
  }

  async loadTicketHistory() {
    // Retrieve cookies from local storage

    // Check if cookies were saved
    // Include cookies in the headers
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    // Ticket data is not stored, make the request
    const url = 'https://proxy-server-rho-pearl.vercel.app/api/server';
    const formData = new URLSearchParams();
    formData.append('filter[filters][0][value]', '4');
    formData.append('filter[filters][0][field]', 'bereich');
    formData.append('filter[filters][0][operator]', 'eq');
    formData.append('filter[logic]', 'and');
    formData.append('take', '5');

    const params = {
      bereich: 'portal',
      modul_id: '15',
      klasse: 'benutzer_transaktionen',
      com: 'liste_transaktionen',
      cli_mode: '1',
    };

    try {
      const response: any = await firstValueFrom(
        this.http.post(url, formData.toString(), {
          params: params,
          headers: headers,
        })
      );
      const ticketData = response?.daten?.items ?? [];
      this.history = ticketData;
      console.log(this.history);

      // Store the ticket data in local storage for future use
      localStorage.setItem('ticketData', JSON.stringify(ticketData));
    } catch (error) {
      console.error(error);
    }
  }

  openDetails(index: number) {
    // Toggle the open state for the clicked item
    this.isOpen[index] = !this.isOpen[index];
  }

  openFilm(filmId: number) {
    this.router.navigate(['/filmoverview', filmId]);
  }

  toggleImage() {
    this.isToggled = !this.isToggled;
  }

  // openTicket(){
  //   const modal = document.querySelector('#ticketoverview');
  //   modal!.present();
  // }

  cancel() {
    this.modal1.dismiss(null, 'cancel');
    this.modal2.dismiss(null, 'cancel');
    this.modal0.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal1.dismiss(null, 'confirm');
  }

  handleChange(ev: any) {
    this.currentTags = ev.target.value;
  }
}
