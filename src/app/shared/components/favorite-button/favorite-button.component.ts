import { Component, Input, OnInit } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { FavoritesService } from 'src/app/core/services/favorites/favorites.service';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { ImpactStyle } from '@capacitor/haptics';
import { Film, NewFilm } from 'src/app/core/models/filmModel';

@Component({
  selector: 'app-favorite-button',
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon],
})
export class FavoriteButtonComponent implements OnInit {
  @Input() film!: Film | NewFilm;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  isFavorite = false;

  constructor(
    private favoritesService: FavoritesService,
    private hapticService: HapticService
  ) {
    addIcons({ heart, heartOutline });
  }

  async ngOnInit() {
    const filmId = this.film.system_id || this.film.film_system_id;
    this.isFavorite = await this.favoritesService.isFavorite(filmId);
  }

  async toggleFavorite() {
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    this.isFavorite = await this.favoritesService.toggleFavorite(this.film);
  }
}