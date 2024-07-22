import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Film } from 'src/app/models/filmModel';
import { FilmDataService } from 'src/app/services/film-data/film-data.service';
import { WebscraperService } from 'src/app/services/scraper/webscraper.service';

@Component({
  selector: 'app-film-select',
  templateUrl: './film-select.component.html',
  styleUrls: ['./film-select.component.scss'],
})
export class FilmSelectComponent {
  @Input() items!: any[];
  @Input() showSelect!: boolean;
  @Input() filterType!: string;
  @Output() filmClick = new EventEmitter<any>();
  isLoading: boolean = false;
  topFilms: Film[] = [];
  selectedItem!: string;
  constructor(private filmGetter: FilmDataService, private webScrapingService: WebscraperService) {
  }

  async loadData() {
    if (this.items && this.items.length > 0) {
      this.selectedItem = this.items[0].id;
    }      
    await this.getFilmsByFilter(this.selectedItem);
  }

  async getFilmsByFilter(data?: string): Promise<void> {
    const formData = new FormData();
    formData.append('get_filter_aktiv', 'true');
    formData.append('filter[ovfilme]', '0');
    formData.append('filter[leinwand_highlight]', '0');
    let films: Film[] = [];
    if (this.filterType && data) {
      formData.append(this.filterType, data);
    }
    try {
      films = await this.filmGetter.fetchFilmData(formData);
    }
    catch (error) {
      console.log(error)
    }
    this.topFilms = this.getTop10Films(films);    
    await this.updateFilmData();
  }

  onFilmClick(film: any) {
    this.filmClick.emit(film);
  }

  private async updateFilmData() {
    const filmPromises = this.topFilms.map(async (film: { filminfo_href: any; }) => {
      if (film.filminfo_href !== undefined) {
        const filmContent = await this.webScrapingService.scrapeData(film.filminfo_href);
        return { ...film, ...filmContent };
      }
      return film;
    });
    this.topFilms = await Promise.all(filmPromises);
  }

  getTop10Films(films: Film[]): Film[] {
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
