import { Component, Input, OnInit } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { FavoritesService } from 'src/app/core/services/favorites/favorites.service';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-favorite-button',
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon],
})
export class FavoriteButtonComponent implements OnInit {
  @Input() filmId!: string;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  isFavorite = false;

  constructor(
    private favoritesService: FavoritesService,
    private hapticService: HapticService
  ) {}

  async ngOnInit() {
    this.isFavorite = await this.favoritesService.isFavorite(this.filmId);
  }

  async toggleFavorite() {
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    this.isFavorite = await this.favoritesService.toggleFavorite(this.filmId);
  }
}