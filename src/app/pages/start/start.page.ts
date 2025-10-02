import { Component, ViewChildren, QueryList, ViewChild, OnInit, computed } from "@angular/core";
import { ImpactStyle } from "@capacitor/haptics";
import { IonRefresherContent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonButton, IonIcon, IonModal, IonButtons, IonGrid } from "@ionic/angular/standalone";
import { NgFor, NgIf } from "@angular/common";
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { heart, close } from 'ionicons/icons';
import { HapticService } from "src/app/core/services/haptic/haptic.service";
import { LoadingService } from "src/app/core/services/loader/loading.service";
import { ToastService } from "src/app/core/services/toast/toast.service";
import { FavoritesService } from "src/app/core/services/favorites/favorites.service";
import { FilmSelectComponent } from "src/app/shared/components/film-select/film-select.component";
import { Film, NewFilm } from "src/app/core/models/film.model";
import * as Filtertags from "src/app/core/constants/filtertags.constants";
import { FilmViewMediumComponent } from "src/app/shared/components/film-view-medium/film-view-medium.component";

@Component({
  selector: 'app-tab1',
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss'],
  standalone: true,
  imports: [IonRefresherContent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonButton, IonIcon, IonModal, IonButtons, IonGrid, NgFor, NgIf, FilmSelectComponent, FilmViewMediumComponent],
})
export class StartPage implements OnInit {
  @ViewChildren(FilmSelectComponent)
  filmSelectComponents!: QueryList<FilmSelectComponent>;
  @ViewChild('favoritesModal', { static: false }) modal!: IonModal;

  genres = Filtertags.genresTag;
  flags = Filtertags.flags;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;

  upcomingFavorites = computed(() =>
    this.favoritesService.favoriteFilms().filter(film => this.isFilmUpcoming(film))
  );
  currentFavorites = computed(() =>
    this.favoritesService.favoriteFilms().filter(film => !this.isFilmUpcoming(film))
  );
  presentingElement!: HTMLElement | null;

  constructor(
    public loadingService: LoadingService,
    private toastService: ToastService,
    private hapticService: HapticService,
    private favoritesService: FavoritesService,
    private router: Router,
  ) {
    addIcons({ heart, close });
  }

  ngOnInit(): void {
    this.presentingElement = document.querySelector('ion-router-outlet');
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

  private isFilmUpcoming(film: Film | NewFilm): boolean {
    // TODO add seperation for films that are not in cinema anymore
    const currentDate = new Date();
    const filmDate = this.parseGermanDate(film.film_centerstart_zeit);

    return filmDate > currentDate;
  }

  private parseGermanDate(dateStr: string): Date {
    if (typeof dateStr === 'string' && dateStr.includes('.')) {
      const [day, month, year] = dateStr.split('.');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date(dateStr);
  }

  navigateToFilm(film: Film | NewFilm): void {
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    this.modal.dismiss();

    const isUpcoming = this.isFilmUpcoming(film);
    if (isUpcoming) {
      this.router.navigate(['/tabs/news'], { queryParams: { search: film.film_titel } });
    } else {
      this.router.navigate(['/tabs/film'], { queryParams: { search: film.film_titel } });
    }
  }
}
