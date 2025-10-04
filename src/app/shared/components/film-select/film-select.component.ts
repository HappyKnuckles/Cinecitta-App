import { NgIf, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonSkeletonText, IonItem, IonGrid, IonRow, IonCol, IonSelect, IonSelectOption, IonRippleEffect } from '@ionic/angular/standalone';
import { Film } from 'src/app/core/models/film.model';
import { FilmDataService } from 'src/app/core/services/film-data/film-data.service';
import { WebscraperService } from 'src/app/core/services/scraper/webscraper.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { TransformTimePipe } from '../../pipes/time-transformer/transform-time.pipe';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-film-select',
  templateUrl: './film-select.component.html',
  styleUrls: ['./film-select.component.scss'],
  standalone: true,
  imports: [
    IonSkeletonText,
    IonItem,
    IonGrid,
    IonRow,
    NgIf,
    IonCol,
    IonSelect,
    FormsModule,
    NgFor,
    IonSelectOption,
    TransformTimePipe,
    IonRippleEffect,
  ],
})
export class FilmSelectComponent implements OnInit {
  @Input() items!: any[];
  @Input() showSelect!: boolean;
  @Input() filterType!: string;
  @Output() filmClick = new EventEmitter<any>();
  topFilms: Film[] = [];
  selectedItem!: string;
  isLoading = signal(true);
  constructor(
    private filmData: FilmDataService,
    private webScrapingService: WebscraperService,
    private storageService: StorageService,
    public toastService: ToastService,
    private router: Router
  ) {
  }

  async ngOnInit(): Promise<void> {
    if (this.items && this.items.length > 0) {
      this.selectedItem = this.items[0].id;
    }
    await this.getFilmsByFilter(this.selectedItem)
  }

  async loadData(isReload?: boolean): Promise<boolean> {
    if (this.items && this.items.length > 0) {
      this.selectedItem = this.items[0].id;
    }

    return await this.getFilmsByFilter(this.selectedItem, isReload);
  }

  async getFilmsByFilter(data?: string, isReload?: boolean): Promise<boolean> {
    this.isLoading.set(true);
    const cacheKey = `films-${this.filterType}-${data}`;
    const maxAge = 12 * 60 * 60 * 1000;
    try {
      const hasInternet = (await Network.getStatus()).connected;

      if (!hasInternet && isReload) {
        throw new Error('No internet connection');
      }

      const cachedFilms = await this.storageService.getLocalStorage(cacheKey, maxAge, hasInternet);
      if ((cachedFilms && !isReload) || !hasInternet) {
        this.topFilms = this.getTopFilms(await cachedFilms);
        return !hasInternet;
      }

      const formData = new FormData();
      formData.append('get_filter_aktiv', 'true');
      formData.append('filter[ovfilme]', '0');
      formData.append('filter[leinwand_highlight]', '0');
      let films: Film[] = [];
      if (this.filterType && data) {
        formData.append(this.filterType, data);
      }
      films = await this.filmData.fetchFilmData(formData);
      this.topFilms = this.getTopFilms(films);
      await this.updateFilmData();
    } catch (error) {
      console.error(error);
      this.toastService.showToast('Unable to load data. No internet connection.', 'alert-outline', true);
    } finally {
      this.isLoading.set(false);
    }
    await this.storageService.setLocalStorage(cacheKey, this.topFilms);
    return false;
  }

  onFilmClick(film: Film): void {
    this.router.navigate(['/tabs/film'], { queryParams: { search: film.film_titel } });
  }

  private async updateFilmData(): Promise<any> {
    const filmPromises = this.topFilms.map(async (film: { filminfo_href: string }) => {
      if (film.filminfo_href !== undefined) {
        const filmContent = await this.webScrapingService.scrapeData(film.filminfo_href, this.storageService);
        return { ...film, ...filmContent };
      }
      return film;
    });
    this.topFilms = await Promise.all(filmPromises);
  }

  private getTopFilms(films: Film[]): Film[] {
    const filmMap = new Map<string, Film>();
    films.forEach((film) => {
      if (!filmMap.has(film.film_titel)) {
        filmMap.set(film.film_titel, film);
      }
    });

    const uniqueFilms = Array.from(filmMap.values());

    return uniqueFilms.sort((a, b) => (b.vorstellungen_anzahl_tage_max ?? 0) - (a.vorstellungen_anzahl_tage_max ?? 0)).slice(0, 7);
  }
}
