import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { IonInput } from '@ionic/angular';
import { Subject, Subscription, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tab3',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss'],
  animations: [
    trigger('openClose', [
      state('true', style({ opacity: 0, 'font-size': '0', height: '0' })),
      state('false', style({ opacity: 1, 'font-size': '*', height: '*' })),
      transition('false <=> true', [animate('400ms ease-in-out')]),
    ]),
  ]
})

export class NewsPage {
  allFilms: any[] = [];
  newFilms: any[] = [];
  showFull: boolean[] = [];
  isLoading: boolean = false;
  isSearchOpen: boolean = false;
  searchQuery: string = '';
  private searchSubject: Subject<string> = new Subject<string>();
  sub: Subscription = new Subscription();

  @ViewChild('searchInput', { static: false }) searchInput!: IonInput;

  constructor(
    private http: HttpClient,
  ) { }


  async ngOnInit() {
    this.isLoading = true;
    await this.fetchNewFilms();
    this.isLoading = false;
    // Subscribe to the search subject
    this.sub = this.searchSubject.pipe(
      debounceTime(300), // Wait for 300ms after the last keystroke
      distinctUntilChanged() // Only emit if the new value is different from the previous one
    ).subscribe(searchQuery => {
      // Update the films array based on the search query
      this.filterFilms(searchQuery);
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      this.fetchNewFilms();
      event.target.complete();
    }, 100);
  }

  openSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) {
      this.searchInput.getInputElement().then((inputElement) => {
        inputElement.blur();
      });
    } else {
      this.searchInput.setFocus();
    }
  }

  onSearchChange(searchValue: string) {
    this.searchQuery = searchValue.trim().toLowerCase();
    this.searchSubject.next(this.searchQuery);
  }

  filterFilms(searchQuery: string) {
    const excludedProperties = [
      'film_beschreibung',
      'film_cover_src',
      'film_favored',
      'filminfo_href',
      'film_system_id',
      'system_id',
    ];
    if (!searchQuery) {
      // If search query is empty, show all films
      this.newFilms = this.allFilms;
    } else {
      // Filter films based on search query
      this.newFilms = this.allFilms.filter((film) =>
        Object.entries(film).some(([key, value]) => {
          if (excludedProperties.includes(key)) {
            return false; // Exclude the property from filtering
          }
          return (
            value && value.toString().toLowerCase().includes(this.searchQuery)
          );
        })
      );
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
      this.filterFilms(this.searchQuery);
    } catch (error) {
      console.error(error);
    }

    this.isLoading = false;
  }
}