import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('modal1') modal1!: IonModal;
  @ViewChild('modal2') modal2!: IonModal;
  username: string = '';
  password: string = '';

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

  image = "assets/images/default-avatar.png";
  image2 = "assets/images/hellow.png";
  sub: Subscription = new Subscription;
  isToggled: boolean = false;
  constructor(private router: Router,
    private http: HttpClient
  ) {
  }

  async ngOnInit() {
    await this.loadTicketHistory();
  }


  async login(username: string, password: string): Promise<boolean> {
    const url = 'http://localhost:8080/https://www.cinecitta.de/common/ajax.php?bereich=portal&modul_id=1&klasse=login&com=login';
    const formData = new FormData();
    formData.append('login_kennung', username); // Use 'login_kennung' as the field name for username
    formData.append('login_passwort', password); // Use 'login_passwort' as the field name for password
  
    try {
      const response: any = await firstValueFrom(this.http.post(url, formData));
      console.log(response); // Log the response to inspect its structure
  
      // Check the response to determine if login was successful
      const success = response?.fehler?.code === 0;
      if (success) {
        // Perform any additional actions upon successful login
        console.log('Login successful');
        return true;
      } else {
        console.log('Login failed');
        return false;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }


  async loadTicketHistory() {
    const isLoggedIn = await this.login(this.username, this.password); // Replace `username` and `password` with actual values
  
    if (isLoggedIn) {
      // Check if the films data is already stored
      const storedTicketData = localStorage.getItem('ticketData');
      if (storedTicketData) {
        // Use the stored data instead of making a request
        this.history = JSON.parse(storedTicketData);
        console.log(this.history);
        return; // Exit the function since data is already available
      }
  
      // Films data is not stored, make the request
      const url =
        'http://localhost:8080/https://www.cinecitta.de/common/ajax.php?bereich=portal&modul_id=15&klasse=benutzer_transaktionen&com=liste_transaktionen&cli_mode=1';
      try {
        const response: any = await firstValueFrom(this.http.post(url, null));
        console.log(response); // Log the response to inspect its structure
        const ticketData = response?.daten?.items ?? [];
        this.history = ticketData;
        console.log(this.history);
  
        // Store the films data in local storage for future use
        localStorage.setItem('ticketData', JSON.stringify(ticketData));
      } catch (error) {
        console.error(error);
      }
    } else {
      // User is not logged in, handle the appropriate action (e.g., show login prompt)
      console.log('User is not logged in');
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
  }

  confirm() {
    this.modal1.dismiss(null, 'confirm');
  }

  handleChange(ev: any) {
    this.currentTags = ev.target.value;
  }
}
