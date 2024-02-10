import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { IonInput } from '@ionic/angular';
import { Subject, Subscription, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { SearchComponent } from 'src/app/common/search/search.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss']
})

export class NewsPage {
  allFilms: any[] = [];
  newFilms: any[] = [];
  showFull: boolean[] = [];
  isLoading: boolean = false;
  isSearchOpen: boolean = false;
  excluded = [
    'film_beschreibung',
    'film_cover_src',
    'film_favored',
    'filminfo_href',
    'film_system_id',
    'system_id',
    'film_synopsis',
    'bild_beschreibung',
    'bild_name',
    'film_teasertext',
    'system_name',
    'film_kurztext'
  ]

  @ViewChild(SearchComponent, { static: false }) searchInput!: SearchComponent;

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

  openSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.searchInput.focusInput();
    } else {
      this.searchInput.blurInput();
    }
  }

  async openExternalWebsite(url: string) {
    const options = {
      toolbarColor: '#1d979f', // Customize the browser toolbar color
    };
    const finishedUrl = 'https://cinecitta.' + url;

    try {
      await Browser.open({ url: finishedUrl, windowName: '_self', toolbarColor: options.toolbarColor });
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
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

      this.allFilms = response?.daten?.items ?? [];
      this.newFilms = this.allFilms;
    } catch (error) {
      console.error(error);
    }

    this.isLoading = false;
  }
}