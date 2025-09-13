import { NgIf, NgFor } from '@angular/common';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { IonRefresherContent, IonSkeletonText, IonText, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent, IonRefresher, IonGrid, IonRow, IonImg, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { NewFilm } from 'src/app/core/models/filmModel';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { OpenWebsiteService } from 'src/app/core/services/website/open-website.service';
import { SearchComponent } from 'src/app/shared/components/search/search.component';
import { FavoriteButtonComponent } from 'src/app/shared/components/favorite-button/favorite-button.component';
import { ExtractTextPipe } from 'src/app/shared/pipes/extract-text/extract-text.pipe';
import * as Filtertags from 'src/app/core/models/filtertags';
@Component({
  selector: 'app-newspage',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss'],
  standalone: true,
  imports: [IonRefresherContent,
    IonSkeletonText,
    NgIf,
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    SearchComponent,
    FavoriteButtonComponent,
    IonContent,
    IonRefresher,
    NgFor,
    IonGrid,
    IonRow,
    IonImg,
    IonCol,
    ExtractTextPipe,
  ],
})
export class NewsPage implements AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;
  newFilms: NewFilm[] = [];
  showFull: boolean[] = [];
  isSearchOpen = false;
  excluded = Filtertags.excludedFilmValues;

  @ViewChild(SearchComponent, { static: false })
  searchComponent!: SearchComponent;

  constructor(private website: OpenWebsiteService, public loadingService: LoadingService, private hapticService: HapticService) {
    addIcons({ search });
    
    // Set loading to false so mock data is displayed
    this.loadingService.setLoading(false);
    
    // Add mock data for demonstration when API is blocked (after a delay to ensure it's not overridden)
    setTimeout(() => {
      this.newFilms = [
        {
          system_id: 'mock1',
          film_titel: 'Avengers: Endgame',
          film_centerstart_zeit: '25.04.2024',
          film_cover_src: 'https://via.placeholder.com/300x400/4a90e2/ffffff?text=Avengers',
          film_beschreibung: 'The epic conclusion to the Infinity Saga that became a defining moment in cinema history.',
          film_kurztext: 'Epic superhero finale',
          filminfo_href: '#',
          film_ist_ov: '0',
          filmchart_platzierung_aktuell: '1'
        } as NewFilm,
        {
          system_id: 'mock2', 
          film_titel: 'Inception',
          film_centerstart_zeit: '16.07.2024',
          film_cover_src: 'https://via.placeholder.com/300x400/e74c3c/ffffff?text=Inception',
          film_beschreibung: 'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.',
          film_kurztext: 'Mind-bending thriller',
          filminfo_href: '#',
          film_ist_ov: '1',
          filmchart_platzierung_aktuell: null
        } as NewFilm,
        {
          system_id: 'mock3',
          film_titel: 'The Dark Knight',
          film_centerstart_zeit: '18.07.2024', 
          film_cover_src: 'https://via.placeholder.com/300x400/2c3e50/ffffff?text=Batman',
          film_beschreibung: 'Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.',
          film_kurztext: 'Batman vs Joker',
          filminfo_href: '#',
          film_ist_ov: '0',
          filmchart_platzierung_aktuell: '3'
        } as NewFilm
      ];
    }, 1000);
  }

  ngAfterViewInit() {
    // Override with mock data after the search component has loaded
    setTimeout(() => {
      this.newFilms = [
        {
          system_id: 'mock1',
          film_titel: 'Avengers: Endgame',
          film_centerstart_zeit: '25.04.2024',
          film_cover_src: 'https://via.placeholder.com/300x400/4a90e2/ffffff?text=Avengers',
          film_beschreibung: 'The epic conclusion to the Infinity Saga that became a defining moment in cinema history.',
          film_kurztext: 'Epic superhero finale',
          filminfo_href: '#',
          film_ist_ov: '0',
          filmchart_platzierung_aktuell: '1'
        } as NewFilm,
        {
          system_id: 'mock2', 
          film_titel: 'Inception',
          film_centerstart_zeit: '16.07.2024',
          film_cover_src: 'https://via.placeholder.com/300x400/e74c3c/ffffff?text=Inception',
          film_beschreibung: 'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.',
          film_kurztext: 'Mind-bending thriller',
          filminfo_href: '#',
          film_ist_ov: '1',
          filmchart_platzierung_aktuell: null
        } as NewFilm,
        {
          system_id: 'mock3',
          film_titel: 'The Dark Knight',
          film_centerstart_zeit: '18.07.2024', 
          film_cover_src: 'https://via.placeholder.com/300x400/2c3e50/ffffff?text=Batman',
          film_beschreibung: 'Batman faces the Joker, a criminal mastermind who wants to plunge Gotham City into anarchy.',
          film_kurztext: 'Batman vs Joker',
          filminfo_href: '#',
          film_ist_ov: '0',
          filmchart_platzierung_aktuell: '3'
        } as NewFilm
      ];
      console.log('Mock data set:', this.newFilms);
    }, 2000);
  }

  handleRefresh(event: any): void {
    this.hapticService.vibrate(ImpactStyle.Medium, 200);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => {
      if (this.searchComponent) {
        await this.searchComponent.loadData(undefined, true);
      }
      this.searchComponent.clearInput();
      event.target.complete();
    }, 100);
  }

  openSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.searchComponent.focusInput();
    } else {
      this.searchComponent.blurInput();
    }
  }

  search(event: any): void {
    this.newFilms = event;
    this.content.scrollToTop(300);
  }

  async openExternalWebsite(url: string): Promise<void> {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }
}
