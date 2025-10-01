import { NgIf } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import { IonCol, IonRow, IonImg, IonIcon, IonSkeletonText } from '@ionic/angular/standalone';
import { Film, NewFilm } from 'src/app/core/models/filmModel';
import { ExtractTextPipe } from '../../pipes/extract-text/extract-text.pipe';
import { OpenWebsiteService } from 'src/app/core/services/website/open-website.service';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { ImpactStyle } from '@capacitor/haptics';
import { FavoritesService } from 'src/app/core/services/favorites/favorites.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { add, heartOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-film-view-medium',
  templateUrl: './film-view-medium.component.html',
  styleUrls: ['./film-view-medium.component.scss'],
  standalone: true,
  imports: [IonSkeletonText, IonIcon, IonImg, IonRow, IonCol, NgIf, ExtractTextPipe]
})
export class FilmViewMediumComponent implements OnInit {
  loadingService = inject(LoadingService);
  film = input.required<Film | NewFilm | null>();
  favoriteFilmIds: Set<string> = new Set();
  showFull = false;
  isNewFilm = input.required<boolean>();
  isRecentFilm = computed(() => {
    const film = this.film();
    return film ? (film as Film).film_neu === 'NEU' : false;
  });
  constructor(private website: OpenWebsiteService, private hapticService: HapticService, private favoritesService: FavoritesService) {
    addIcons({ heartOutline, })
  }

  ngOnInit() {
    this.loadFavorites();
  }

  async openExternalWebsite(url: string): Promise<void> {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }

  isFavorite(): boolean {
    const film = this.film();
    if (!film) {
      return false;
    }
    const filmId = film.film_system_id || film.system_id;
    return this.favoriteFilmIds.has(filmId);
  }

  async toggleFavorite(event: Event): Promise<void> {
    event.stopPropagation();
    const film = this.film();
    if (!film) {
      return;
    }
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
