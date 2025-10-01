import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Film, NewFilm } from '../../models/filmModel';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'favoriteFilms';

  constructor(private storageService: StorageService) {}
  // TODO make a single point of true for favorited films that reloads when changes happen
  async getFavoriteFilms(): Promise<(Film | NewFilm)[]> {
    const favorites = await this.storageService.get(this.FAVORITES_KEY);
    return favorites || [];
  }

  async addToFavorites(film: Film | NewFilm): Promise<void> {
    const favorites = await this.getFavoriteFilms();
    const filmId = film.system_id || film.film_system_id;
    
    // Check if film is already in favorites
    const exists = favorites.some(f => 
      (f.system_id === filmId) || 
      (f.film_system_id === filmId)
    );
    
    if (!exists) {
      favorites.push(film);
      await this.storageService.save(this.FAVORITES_KEY, favorites);
    }
  }

  async removeFromFavorites(filmId: string): Promise<void> {
    const favorites = await this.getFavoriteFilms();
    const updatedFavorites = favorites.filter(film => 
      film.system_id !== filmId && 
      film.film_system_id !== filmId
    );
    await this.storageService.save(this.FAVORITES_KEY, updatedFavorites);
  }

  async isFavorite(filmId: string): Promise<boolean> {
    const favorites = await this.getFavoriteFilms();
    return favorites.some(film => 
      film.system_id === filmId || 
      film.film_system_id === filmId
    );
  }

  async toggleFavorite(film: Film | NewFilm): Promise<boolean> {
    const filmId = film.system_id || film.film_system_id;
    const isFav = await this.isFavorite(filmId);
    
    if (isFav) {
      await this.removeFromFavorites(filmId);
      return false;
    } else {
      await this.addToFavorites(film);
      return true;
    }
  }
}