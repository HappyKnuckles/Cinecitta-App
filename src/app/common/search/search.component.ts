import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IonInput } from '@ionic/angular';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
} from 'rxjs';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { FilmDataService } from 'src/app/services/film-data/film-data.service';
import { FilmRoutService } from 'src/app/services/film-rout/film-rout.service';
import { title } from 'process';
import { WebscraperService } from 'src/app/services/scraper/webscraper.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: [
    trigger('openClose', [
      state('true', style({ opacity: 0, 'font-size': '0', height: '0' })),
      state('false', style({ opacity: 1, 'font-size': '*', height: '*' })),
      transition('false <=> true', [animate('400ms ease-in-out')]),
    ]),
  ],
})
export class SearchComponent implements OnInit {
  @Input() formData!: FormData;
  @Input() isNewFilms: boolean = false;
  @Input() excludedProperties: any[] = [];
  @Input() showFilterButton: boolean = false;
  @Input({ required: true }) isOpen: boolean = false;

  @Output() newFilmsChange = new EventEmitter<any[]>();
  @Output() setOpenEvent = new EventEmitter<boolean>();
  @ViewChild('searchInput') searchInput?: IonInput;

  allFilms: any[] = [];
  private searchSubject = new Subject<string>();
  searchQuery: string = '';
  sub: Subscription = new Subscription();

  constructor(
    private filmData: FilmDataService,
    private filmRouter: FilmRoutService,
    private webScrapingService: WebscraperService
  ) {}

  async ngOnInit() {
    this.sub.add(
      this.searchSubject
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(() => {
          this.filterFilms();
        })
    );

    if (this.isNewFilms) {
      this.allFilms = await this.filmData.fetchNewFilms();
    } else {
      this.allFilms = await this.filmData.fetchFilmData(this.formData);
      this.sub.add(
        this.filmRouter.currentFilmTitle.subscribe((title) => {
          this.onSearchChange(title);
        })
      );

    }      await this.updateFilmData();

  }
  private async updateFilmData() {
    const filmPromises = this.allFilms.map(async (film: { filminfo_href: any; }) => {
      if (film.filminfo_href !== undefined) {
        const filmContent = await this.webScrapingService.scrapeData(film.filminfo_href);
        return { ...film, ...filmContent };
      }
      return film;
    });
    this.allFilms = await Promise.all(filmPromises);
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  emitSetOpen(isOpen: boolean) {
    this.setOpenEvent.emit(isOpen);
  }

  filterFilms() {
    if (!this.searchQuery) {
      this.newFilmsChange.emit(this.allFilms);
    } else {
      const filteredFilms = this.allFilms.filter((film: any) =>
        Object.entries(film).some(([key, value]) => {
          if (this.excludedProperties.includes(key)) {
            return false;
          }
          return (
            value &&
            value
              .toString()
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase())
          );
        })
      );
      this.newFilmsChange.emit(filteredFilms);
    }
  }

  focusInput() {
    this.searchInput?.setFocus();
  }

  blurInput() {
    this.searchInput?.getInputElement().then((inputElement) => {
      inputElement.blur();
    });
  }

  onSearchChange(searchValue: string) {
    this.searchQuery = searchValue.trim().toLowerCase();
    this.searchSubject.next(this.searchQuery);
  }

  clearInput() {
    this.searchQuery = '';
    this.searchSubject.next(this.searchQuery);
  }
}
