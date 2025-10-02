import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Film, NewFilm } from '../../models/film.model';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'favoriteFilms';
  #favoriteFilms = signal<(Film | NewFilm)[]>([]);

  readonly favoriteFilms = this.#favoriteFilms.asReadonly();

  readonly favoriteIds = computed(() => {
    return new Set(
      this.#favoriteFilms().map(f => f.system_id || f.film_system_id)
    );
  });

  constructor(
    private storageService: StorageService,
    private toastService: ToastService
  ) {
    this.getFavoriteFilms();
  }

  async getFavoriteFilms(): Promise<(Film | NewFilm)[]> {
    const favorites = await this.storageService.get(this.FAVORITES_KEY);
    this.#favoriteFilms.set(favorites || []);
    return favorites || [];
  }

  async addToFavorites(film: Film | NewFilm): Promise<void> {
    const filmId = this.getFilmId(film);

    if (this.isFavorite(filmId)) {
      return;
    }

    const favorites = [...this.#favoriteFilms(), film];
    await this.storageService.save(this.FAVORITES_KEY, favorites);
    this.#favoriteFilms.set(favorites);
    this.toastService.showToast(
      `${film.film_titel} zu Favoriten hinzugefügt.`,
      'checkmark-outline',
      false
    );
  }

  async removeFromFavorites(filmId: string): Promise<void> {
    const favorites = this.#favoriteFilms();

    const filmToRemove = favorites.find(film =>
      this.getFilmId(film) === filmId
    );

    if (!filmToRemove) {
      return; 
    }

    const updatedFavorites = favorites.filter(film =>
      this.getFilmId(film) !== filmId
    );

    await this.storageService.save(this.FAVORITES_KEY, updatedFavorites);
    this.#favoriteFilms.set(updatedFavorites);

    this.toastService.showToast(
      `${filmToRemove.film_titel} aus Favoriten entfernt.`,
      'remove-outline',
      false
    );
  }

  async toggleFavorite(film: Film | NewFilm): Promise<boolean> {
    const filmId = this.getFilmId(film);
    const isFav = this.isFavorite(filmId);

    if (isFav) {
      await this.removeFromFavorites(filmId);
      return false;
    } else {
      await this.addToFavorites(film);
      return true;
    }
  }

  private isFavorite(filmId: string): boolean {
    return this.favoriteIds().has(filmId);
  }

  private getFilmId(film: Film | NewFilm): string {
    return film.system_id || film.film_system_id;
  }
}