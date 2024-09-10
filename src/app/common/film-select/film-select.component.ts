import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Film } from 'src/app/models/filmModel';
import { FilmDataService } from 'src/app/services/film-data/film-data.service';
import { LoadingService } from 'src/app/services/loader/loading.service';
import { WebscraperService } from 'src/app/services/scraper/webscraper.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { TransformTimePipe } from '../../Pipes/time-transformer/transform-time.pipe';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { IonGrid, IonThumbnail, IonSkeletonText, IonRow, IonCol, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { Network } from '@capacitor/network';
import { has, is } from 'cheerio/lib/api/traversing';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-film-select',
    templateUrl: './film-select.component.html',
    styleUrls: ['./film-select.component.scss'],
    standalone: true,
    imports: [
        IonGrid,
        IonRow,
        NgIf,
        IonCol,
        IonSelect,
        FormsModule,
        NgFor,
        IonSelectOption,
        TransformTimePipe,
        IonSkeletonText,
        IonThumbnail
    ],
})
export class FilmSelectComponent {
    @Input() items!: any[];
    @Input() showSelect!: boolean;
    @Input() filterType!: string;
    @Output() filmClick = new EventEmitter<any>();
    isLoading = false;
    topFilms: Film[] = [];
    selectedItem!: string;
    constructor(
        private filmData: FilmDataService,
        private webScrapingService: WebscraperService,
        private storageService: StorageService,
        private loadingService: LoadingService,
    ) { 
    
    }


    async loadData(isReload?: boolean): Promise<boolean> {
        if (this.items && this.items.length > 0) {
            this.selectedItem = this.items[0].id;
        }
        return await this.getFilmsByFilter(this.selectedItem, isReload);
    }

    async getFilmsByFilter(data?: string, isReload?: boolean): Promise<boolean> {
        const cacheKey = `films-${this.filterType}-${data}`;
        const maxAge = 12 * 60 * 60 * 1000;
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
        try {
            this.isLoading = true
            films = await this.filmData.fetchFilmData(formData);
            this.topFilms = this.getTopFilms(films);
            await this.updateFilmData();
        }
        catch (error) {
            console.log(error)
        }
        finally {
            this.isLoading = false;
        }
        await this.storageService.setLocalStorage(cacheKey, this.topFilms);
        return false;
    }

    onFilmClick(film: Film): void {
        this.filmClick.emit(film);
    }

    private async updateFilmData(): Promise<any> {
        const filmPromises = this.topFilms.map(async (film: { filminfo_href: string; }) => {
            if (film.filminfo_href !== undefined) {
                const filmContent = await this.webScrapingService.scrapeData(film.filminfo_href);
                return { ...film, ...filmContent };
            }
            return film;
        });
        this.topFilms = await Promise.all(filmPromises);
    }

    getTopFilms(films: Film[]): Film[] {
        const filmMap = new Map<string, Film>();
        films.forEach(film => {
            if (!filmMap.has(film.film_titel)) {
                filmMap.set(film.film_titel, film);
            }
        });

        const uniqueFilms = Array.from(filmMap.values());

        return uniqueFilms.sort((a, b) => (b.vorstellungen_anzahl_tage_max ?? 0) - (a.vorstellungen_anzahl_tage_max ?? 0)).slice(0, 7);
    }
}
