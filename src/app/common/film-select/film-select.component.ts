import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { Film } from 'src/app/models/filmModel';
import { FilmDataService } from 'src/app/services/film-data/film-data.service';
import { LoadingService } from 'src/app/services/loader/loading.service';

@Component({
  selector: 'app-film-select',
  templateUrl: './film-select.component.html',
  styleUrls: ['./film-select.component.scss'],
})
export class FilmSelectComponent implements OnInit {
  @Input() items!: any[];
  @Input() showSelect!: boolean;
  @Input() filterType!: string;
  @Output() filmClick = new EventEmitter<any>();
  isLoading: boolean = false;
  topFilms: Film[] = [];
  selectedItem!: string;
  constructor(private filmGetter: FilmDataService) {
  }

  async ngOnInit() {
    if (this.items && this.items.length > 0) {
      this.selectedItem = this.items[0].id;
      await this.getFilmsByFilter(this.selectedItem);
    } else {
      this.getFilmsByFilter();
    }
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
  }

  onFilmClick(film: any) {
    this.filmClick.emit(film);
  }

  getTop10Films(films: Film[]): Film[] {
    const filmMap = new Map<string, Film>();
    films.forEach(film => {
      if (!filmMap.has(film.film_titel)) {
        filmMap.set(film.film_titel, film);
      }
    });

    const uniqueFilms = Array.from(filmMap.values());

    return uniqueFilms.sort((a, b) => (b.vorstellungen_anzahl_tage_max ?? 0) - (a.vorstellungen_anzahl_tage_max ?? 0)).slice(0, 10);
  }


}
