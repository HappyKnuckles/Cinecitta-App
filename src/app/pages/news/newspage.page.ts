import { NgIf, NgFor } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { IonRefresherContent, IonSkeletonText, IonText, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent, IonRefresher, IonGrid, IonRow, IonImg, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, heart, heartOutline } from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
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
export class NewsPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  newFilms: NewFilm[] = [];
  showFull: boolean[] = [];
  isSearchOpen = false;
  excluded = Filtertags.excludedFilmValues;

  @ViewChild(SearchComponent, { static: false })
  searchComponent!: SearchComponent;

  constructor(
    private website: OpenWebsiteService, 
    public loadingService: LoadingService, 
    private hapticService: HapticService,
    private route: ActivatedRoute
  ) {
    addIcons({ search, heart, heartOutline });
    
    // Set loading to false so mock data is displayed
    this.loadingService.setLoading(false);
    
    // Add mock data for demonstration when API is blocked
    setTimeout(() => {
      this.newFilms = [
        {
          system_id: 'news-mock1',
          film_titel: 'The Batman 2',
          film_beschreibung: 'The Dark Knight returns in this highly anticipated sequel.',
          film_cover_src: 'https://via.placeholder.com/300x400/343a40/ffffff?text=Batman+2',
          film_centerstart_zeit: '15.06.2025',
          filminfo_href: '#',
          film_ist_ov: '0',
          filmchart_platzierung_aktuell: '1',
          film_kurztext: 'Batman faces new challenges in Gotham City.',
          film_synopsis: 'Full synopsis of The Batman 2...'
        } as NewFilm,
        {
          system_id: 'news-mock2',
          film_titel: 'Avatar 3',
          film_beschreibung: 'Jake Sully and Neytiri continue their journey on Pandora.',
          film_cover_src: 'https://via.placeholder.com/300x400/17a2b8/ffffff?text=Avatar+3',
          film_centerstart_zeit: '20.12.2025',
          filminfo_href: '#',
          film_ist_ov: '1',
          filmchart_platzierung_aktuell: '2',
          film_kurztext: 'The next chapter in the Avatar saga.',
          film_synopsis: 'Full synopsis of Avatar 3...'
        } as NewFilm,
        {
          system_id: 'news-mock3',
          film_titel: 'Fast & Furious 11',
          film_beschreibung: 'The family returns for one last ride.',
          film_cover_src: 'https://via.placeholder.com/300x400/28a745/ffffff?text=F%26F+11',
          film_centerstart_zeit: '10.07.2025',
          filminfo_href: '#',
          film_ist_ov: '0',
          filmchart_platzierung_aktuell: null,
          film_kurztext: 'The final chapter in the Fast & Furious saga.',
          film_synopsis: 'Full synopsis of Fast & Furious 11...'
        } as NewFilm
      ];
    }, 1000);
  }

  ngOnInit(): void {
    // Subscribe to query parameters to handle search input from navigation
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.isSearchOpen = true;
        // Wait for the search component to be ready, then set the search value
        setTimeout(() => {
          if (this.searchComponent) {
            this.searchComponent.setSearchValue(params['search']);
          }
        }, 100);
      }
    });
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
