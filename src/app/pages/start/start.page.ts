import { Component, ViewChildren, QueryList } from "@angular/core";
import { ImpactStyle } from "@capacitor/haptics";
import { IonRefresherContent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonButton, IonIcon, IonModal, IonButtons, IonGrid, IonRow, IonCol, IonImg } from "@ionic/angular/standalone";
import { NgFor, NgIf } from "@angular/common";
import { addIcons } from 'ionicons';
import { heart, close } from 'ionicons/icons';
import { HapticService } from "src/app/core/services/haptic/haptic.service";
import { LoadingService } from "src/app/core/services/loader/loading.service";
import { ToastService } from "src/app/core/services/toast/toast.service";
import { FavoritesService } from "src/app/core/services/favorites/favorites.service";
import { FilmSelectComponent } from "src/app/shared/components/film-select/film-select.component";
import { Film, NewFilm } from "src/app/core/models/filmModel";
import { ExtractTextPipe } from "src/app/shared/pipes/extract-text/extract-text.pipe";
import * as Filtertags from "src/app/core/models/filtertags";
@Component({
  selector: 'app-tab1',
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss'],
  standalone: true,
  imports: [IonRefresherContent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonButton, IonIcon, IonModal, IonButtons, IonGrid, IonRow, IonCol, IonImg, NgFor, NgIf, FilmSelectComponent, ExtractTextPipe],
})
export class StartPage {
  @ViewChildren(FilmSelectComponent)
  filmSelectComponents!: QueryList<FilmSelectComponent>;
  genres = Filtertags.genresTag;
  flags = Filtertags.flags;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;

  isFavoritesModalOpen = false;
  favoriteFilms: Film[] = [];
  favoriteNewFilms: NewFilm[] = [];
  upcomingFavorites: NewFilm[] = [];
  currentFavorites: Film[] = [];

  constructor(
    public loadingService: LoadingService,
    private toastService: ToastService,
    private hapticService: HapticService,
    private favoritesService: FavoritesService
  ) { 
    addIcons({ heart, close });
  }

  handleRefresh(event: any): void {
    this.hapticService.vibrate(ImpactStyle.Medium, 200);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => {
      await this.fetchDataForAllComponents(true);
      event.target.complete();
    }, 100);
  }

  async fetchDataForAllComponents(isReload?: boolean): Promise<void> {
    try {
      const loadPromises = this.filmSelectComponents.map((component) => component.loadData(isReload));
      const results = await Promise.all(loadPromises);

      if (results.some((result) => result === true)) {
        this.toastService.showToast('No internet connection. Showing cached data. Data could be outdated!', 'alert-outline');
      }
    } catch (error: any) {
      if (error.message === 'No internet connection') {
        this.toastService.showToast('Unable to load data. No internet connection.', 'alert-outline', true);
      }
      console.error(error);
      this.toastService.showToast('Error loading films. Try again later.', 'alert-outline', true);
    }
  }

  async openFavoritesModal(): Promise<void> {
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    await this.loadFavorites();
    this.isFavoritesModalOpen = true;
  }

  closeFavoritesModal(): void {
    this.isFavoritesModalOpen = false;
  }

  private async loadFavorites(): Promise<void> {
    try {
      // For the demo, we'll just show empty or load sample data
      // In a real implementation, you would need to fetch all films data
      // and filter based on favorites
      this.favoriteFilms = [];
      this.favoriteNewFilms = [];
      this.currentFavorites = [];
      this.upcomingFavorites = [];
      
      // Show a message that favorites would be loaded here
      console.log('Favorites functionality is implemented, but needs actual film data to display');
      
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.toastService.showToast('Error loading favorites', 'alert-outline', true);
    }
  }
}
