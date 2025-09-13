import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Film, NewFilm } from '../../models/filmModel';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'favoriteFilms';

  constructor(private storageService: StorageService) {}

  async getFavorites(): Promise<string[]> {
    const favorites = await this.storageService.get(this.FAVORITES_KEY);
    return favorites || [];
  }

  async addToFavorites(filmId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(filmId)) {
      favorites.push(filmId);
      await this.storageService.save(this.FAVORITES_KEY, favorites);
    }
  }

  async removeFromFavorites(filmId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const updatedFavorites = favorites.filter(id => id !== filmId);
    await this.storageService.save(this.FAVORITES_KEY, updatedFavorites);
  }

  async isFavorite(filmId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(filmId);
  }

  async toggleFavorite(filmId: string): Promise<boolean> {
    const isFav = await this.isFavorite(filmId);
    if (isFav) {
      await this.removeFromFavorites(filmId);
      return false;
    } else {
      await this.addToFavorites(filmId);
      return true;
    }
  }

  async getFavoriteFilms(allFilms: Film[]): Promise<Film[]> {
    const favorites = await this.getFavorites();
    return allFilms.filter(film => favorites.includes(film.system_id));
  }

  async getFavoriteNewFilms(allNewFilms: NewFilm[]): Promise<NewFilm[]> {
    const favorites = await this.getFavorites();
    return allNewFilms.filter(film => favorites.includes(film.system_id));
  }
}