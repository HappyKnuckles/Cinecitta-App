import {
  Component,
  ElementRef,
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
import { Film, newFilm } from 'src/app/models/filmModel';

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
  constructor(private filmData: FilmDataService) {}

  async ngOnInit() {
    // Subscribe to searchSubject and debounce the input events
    this.sub = this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.filterFilms();
      });
    if (this.isNewFilms) {
      this.allFilms = await this.filmData.fetchNewFilms();
    } else {
      const result = await this.filmData.fetchFilmData(this.formData);
      this.allFilms = result?.daten?.items ?? [];
    }
    console.log(this.allFilms);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @Input() formData!: FormData;
  @Input() isNewFilms: boolean = false;
  @Input() excludedProperties: any[] = [];
  @Input() showFilterButton: boolean = false;
  @Input({ required: true }) isOpen: boolean = false;

  @Output() newFilmsChange = new EventEmitter<any[]>();
  @Output() setOpenEvent = new EventEmitter<boolean>();
  @ViewChild('searchInput') searchInput?: IonInput; // Use optional chaining

  allFilms: any[] = [];
  private searchSubject = new Subject<string>();
  searchQuery: string = '';
  sub: Subscription = new Subscription();

  // Method to emit the setOpenEvent
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
}
