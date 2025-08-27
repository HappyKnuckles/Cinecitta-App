import { Injectable, signal, computed } from '@angular/core';
import { Film, NewFilm } from '../../models/filmModel';
import { FilmDataService } from '../film-data/film-data.service';
import { StorageService } from '../storage/storage.service';
import { LoadingService } from '../loader/loading.service';
import { Network } from '@capacitor/network';
import { WebscraperService } from '../scraper/webscraper.service';
import Fuse from 'fuse.js';

@Injectable({
  providedIn: 'root',
})
export class FilmStateService {
  // Private signals for state management
  private _films = signal<Film[]>([]);
  private _newFilms = signal<NewFilm[]>([]);
  private _filteredFilms = signal<Film[]>([]);
  private _searchQuery = signal<string>('');
  private _searchCache = new Map<string, Film[]>();

  // Public computed properties
  readonly films = computed(() => this._films());
  readonly newFilms = computed(() => this._newFilms());
  readonly filteredFilms = computed(() => this._filteredFilms());
  readonly searchQuery = computed(() => this._searchQuery());

  constructor(
    private filmDataService: FilmDataService,
    private storageService: StorageService,
    private webScrapingService: WebscraperService,
    private loadingService: LoadingService
  ) {}

  // Load all films with optional form data
  async loadFilms(formData?: FormData, isReload: boolean = false, excludedProperties: string[] = []): Promise<void> {
    this.loadingService.setLoading(true);
    
    try {
      const hasInternet = (await Network.getStatus()).connected;
      if (!hasInternet && isReload) {
        throw new Error('No internet connection');
      }

      let hashedFormData: string | undefined;
      if (formData) {
        const serializedFormData = this.serializeFormData(formData);
        hashedFormData = await this.hashString(serializedFormData);
      }
      
      const cacheKey = `allFilms_${hashedFormData ?? ''}`;
      const maxAge = 12 * 60 * 60 * 1000; // 12 hours

      // Try to get cached data first
      const cachedFilms = await this.storageService.getLocalStorage(cacheKey, maxAge, hasInternet);
      if ((cachedFilms && !isReload) || !hasInternet) {
        this._films.set(cachedFilms || []);
        this.applyCurrentSearch(excludedProperties);
        return;
      }

      // Fetch fresh data
      const films = await this.filmDataService.fetchFilmData(formData);
      this._films.set(films);
      
      // Cache the data
      await this.storageService.setLocalStorage(cacheKey, films);
      
      // Update film data with additional content
      await this.updateFilmData();
      
      // Apply current search filter to new data
      this.applyCurrentSearch(excludedProperties);
      
    } catch (error) {
      console.error('Error loading films:', error);
      throw error;
    } finally {
      this.loadingService.setLoading(false);
    }
  }

  // Load new films
  async loadNewFilms(isReload: boolean = false): Promise<void> {
    this.loadingService.setLoading(true);
    
    try {
      const hasInternet = (await Network.getStatus()).connected;
      if (!hasInternet && isReload) {
        throw new Error('No internet connection');
      }

      const cacheKey = 'newFilms';
      const maxAge = 12 * 60 * 60 * 1000; // 12 hours

      // Try to get cached data first
      const cachedNewFilms = await this.storageService.getLocalStorage(cacheKey, maxAge, hasInternet);
      if ((cachedNewFilms && !isReload) || !hasInternet) {
        this._newFilms.set(cachedNewFilms || []);
        return;
      }

      // Fetch fresh data
      const newFilms = await this.filmDataService.fetchNewFilms();
      this._newFilms.set(newFilms);
      
      // Cache the data
      await this.storageService.setLocalStorage(cacheKey, newFilms);
      
    } catch (error) {
      console.error('Error loading new films:', error);
      throw error;
    } finally {
      this.loadingService.setLoading(false);
    }
  }

  // Search functionality
  search(query: string, excludedProperties: string[] = []): void {
    this._searchQuery.set(query.trim().toLowerCase());
    this.applyCurrentSearch(excludedProperties);
  }

  // Clear search
  clearSearch(): void {
    this._searchQuery.set('');
    this._filteredFilms.set(this._films());
  }

  // Private helper methods
  private applyCurrentSearch(excludedProperties: string[] = []): void {
    const query = this._searchQuery();
    const films = this._films();
    
    if (!query) {
      this._filteredFilms.set(films);
      return;
    }

    // Check cache first
    if (this._searchCache.has(query)) {
      this._filteredFilms.set(this._searchCache.get(query)!);
      return;
    }

    // Perform search if we have films
    if (films.length > 0) {
      const options = {
        keys: [
          { name: 'film_titel', weight: 0.7 },
          ...Object.keys(films[0])
            .filter((key) => !excludedProperties.includes(key) && key !== 'film_titel')
            .map((key) => ({ name: key, weight: 0.3 })),
        ],
        threshold: 0.3,
        ignoreLocation: true,
        minMatchCharLength: 3,
        includeMatches: true,
        includeScore: true,
        shouldSort: true,
        useExtendedSearch: false,
      };

      const fuse = new Fuse(films, options);
      const result = fuse.search(query);
      const filteredFilms = result.map(({ item }: { item: Film }) => item);

      // Cache the result
      this._searchCache.set(query, filteredFilms);
      this._filteredFilms.set(filteredFilms);
    }
  }

  private async updateFilmData(): Promise<void> {
    const films = this._films();
    const filmPromises = films.map(async (film, index) => {
      if (film.filminfo_href !== undefined) {
        const filmContent = await this.webScrapingService.scrapeData(film.filminfo_href, this.storageService);
        const updatedFilms = [...films];
        updatedFilms[index] = { ...film, ...filmContent };
        this._films.set(updatedFilms);
      }
    });

    await Promise.all(filmPromises);
  }

  private serializeFormData(formData: FormData): string {
    const entries = [];
    for (const [key, value] of (formData as any).entries()) {
      entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }
    return entries.join('&');
  }

  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
}