import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const url = "https://proxy-server-rho-pearl.vercel.app/api/server";
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
  


  async loadTicketHistory() {
 // Retrieve cookies from local storage
 const savedCookies = localStorage.getItem('appCookies');

 // Check if cookies were saved
 if (savedCookies) {
   // Include cookies in the headers
   console.log("True");
   const headers = new HttpHeaders({
     'Content-Type': 'application/x-www-form-urlencoded',
     'Cookie': savedCookies, // Set the appropriate headers for cookies
   });
    // Ticket data is not stored, make the request
    const url = "https://proxy-server-rho-pearl.vercel.app/api/server";
    const formData = new URLSearchParams();
    formData.append('filter[filters][0][value]', "4")
    formData.append('filter[filters][0][field]', "bereich")
    formData.append('filter[filters][0][operator]', "eq")
    formData.append('filter[logic]', "and")
    formData.append('take', "5")

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
       console.log(response); // Log the response to inspect its structure
      const ticketData = response?.daten?.items ?? [];
      this.history = ticketData;
      console.log(this.history);

      // Store the ticket data in local storage for future use
      localStorage.setItem('ticketData', JSON.stringify(ticketData));
    } catch (error) {
      console.error(error);
    }
  }}

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
