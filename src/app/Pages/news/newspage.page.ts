import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss']
})

export class NewsPage {
  newFilms: any[] = [];
  showFull: boolean[] = [];
  isLoading: boolean = false;
  constructor(
    private http: HttpClient,
  ) { }


  async ngOnInit() {
    this.isLoading = true;
    await this.fetchNewFilms();
    this.isLoading = false;
  }
  handleRefresh(event: any) {
    setTimeout(() => {
      this.fetchNewFilms();
      event.target.complete();
    }, 100);
  }

  async fetchNewFilms() {
    const url = "https://proxy-server-rho-pearl.vercel.app/api/server";
  
    const params = {
      bereich: 'portal',
      modul_id: '101',
      klasse: 'vorstellungen',
      cli_mode: '1',
      com: 'anzeigen_vorankuendigungen',
    };
  
    const formData = new URLSearchParams();
    formData.append('filter[genres_tags_not][]', '185305');
    // formData.append('filter[extra][]', 'vorverkauf');
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded', // Set the content type to URL-encoded
    });
  
    try {
      this.isLoading = true;
  
      const response: any = await firstValueFrom(
        this.http.post(url, formData.toString(), {
          params: params,
          headers: headers,
        })
      );
  
      this.newFilms = response?.daten?.items ?? [];
    } catch (error) {
      console.error(error);
    }
  
    this.isLoading = false;
  }
}