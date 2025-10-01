import { NgIf, NgFor } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { IonRefresherContent, IonSkeletonText, IonText, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent, IonRefresher, IonGrid, IonRow, IonImg, IonCol, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, heart, heartOutline } from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
import { NewFilm, Film } from 'src/app/core/models/filmModel';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { OpenWebsiteService } from 'src/app/core/services/website/open-website.service';
import { FavoritesService } from 'src/app/core/services/favorites/favorites.service';
import { SearchComponent } from 'src/app/shared/components/search/search.component';
import { ExtractTextPipe } from 'src/app/shared/pipes/extract-text/extract-text.pipe';
import * as Filtertags from 'src/app/core/models/filtertags';
@Component({
  selector: 'app-newspage',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss'],
  standalone: true,
  imports: [IonButtons, IonRefresherContent,
    IonSkeletonText,
    NgIf,
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    SearchComponent,
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
  favoriteFilmIds: Set<string> = new Set();

  @ViewChild(SearchComponent, { static: false })
  searchComponent!: SearchComponent;

  constructor(
    private website: OpenWebsiteService, 
    public loadingService: LoadingService, 
    private hapticService: HapticService,
    private route: ActivatedRoute,
    private favoritesService: FavoritesService
  ) {
    addIcons({ search, heart, heartOutline });
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
    this.loadFavorites();
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
    this.loadFavorites();
    this.content.scrollToTop(300);
  }

  async openExternalWebsite(url: string): Promise<void> {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }

  async isFavorite(film: NewFilm): Promise<boolean> {
    const filmId = film.film_system_id || film.system_id;
    return this.favoriteFilmIds.has(filmId);
  }

  async toggleFavorite(event: Event, film: NewFilm): Promise<void> {
    event.stopPropagation();
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    const isFav = await this.favoritesService.toggleFavorite(film);
    const filmId = film.film_system_id || film.system_id;
    if (isFav) {
      this.favoriteFilmIds.add(filmId);
    } else {
      this.favoriteFilmIds.delete(filmId);
    }
  }

  async loadFavorites(): Promise<void> {
    const favorites = await this.favoritesService.getFavoriteFilms();
    this.favoriteFilmIds = new Set(favorites.map((f: Film | NewFilm) => f.system_id || f.film_system_id));
  }
}
