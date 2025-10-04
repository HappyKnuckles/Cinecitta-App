import { NgIf } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { IonCol, IonRow, IonImg, IonIcon, IonSkeletonText } from '@ionic/angular/standalone';
import { Film, NewFilm } from 'src/app/core/models/film.model';
import { ExtractTextPipe } from '../../pipes/extract-text/extract-text.pipe';
import { OpenWebsiteService } from 'src/app/core/services/website/open-website.service';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { ImpactStyle } from '@capacitor/haptics';
import { FavoritesService } from 'src/app/core/services/favorites/favorites.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { heartOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { DoubleClickLikeDirective } from 'src/app/core/directives/double-click-like/double-click-like.directive';

@Component({
  selector: 'app-film-view-medium',
  templateUrl: './film-view-medium.component.html',
  styleUrls: ['./film-view-medium.component.scss'],
  standalone: true,
  imports: [IonSkeletonText, IonIcon, IonImg, IonRow, IonCol, NgIf, ExtractTextPipe, DoubleClickLikeDirective]
})
export class FilmViewMediumComponent{
  loadingService = inject(LoadingService);
  film = input.required<Film | NewFilm | null>();
  favoriteFilmIds = computed(() => new Set(this.favoritesService.favoriteFilms().map(film => film.system_id || film.film_system_id)));

  showFull = false;
  isNewFilm = input.required<boolean>();
  isRecentFilm = computed(() => {
    const film = this.film();
    return film ? (film as Film).film_neu === 'NEU' : false;
  });
  constructor(private website: OpenWebsiteService, private hapticService: HapticService, private favoritesService: FavoritesService) {
    addIcons({ heartOutline, })
  }

  async openExternalWebsite(url: string): Promise<void> {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }

  async toggleFavorite(event: Event): Promise<void> {
    event.stopPropagation();
    const film = this.film();
    if (!film) {
      return;
    }
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    await this.favoritesService.toggleFavorite(film);
  }

}
