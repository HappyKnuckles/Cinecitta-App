import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss']
})

// https://www.cinecitta.de/common/ajax.php?bereich=portal&modul_id=101&klasse=vorstellungen&cli_mode=1&com=anzeigen_vorankuendigungen
// API - Link für Filme die demnächst kommen
export class NewsPage {
  newFilms: any[] = [];
  showFull: boolean[] = [];
  isLoading: boolean = false;
  constructor(
    private http: HttpClient,
  ) {}


  async ngOnInit(){
    this.isLoading = true;
    await this.fechtNewFilms();
    this.isLoading = false;
  }
  async fechtNewFilms(){
    const url = 'http://localhost:8080/https://www.cinecitta.de/common/ajax.php';
    const formData = new FormData();
    formData.append('filter[genres_tags_not][]', "185305")
    const params = {
      bereich: 'portal',
      modul_id: '101',
      klasse: 'vorstellungen',
      cli_mode: '1',
      com: 'anzeigen_vorankuendigungen',
    };

    const response: any = await firstValueFrom(this.http.post(url, formData, { params }));
    this.newFilms = response?.daten?.items ?? [];
  }
}
