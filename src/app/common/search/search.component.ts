import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { FilmoverviewModule } from '../../Pages/film/filmoverview.module';
import { FilmOverviewPage } from '../../Pages/film/filmoverview.page';
import { trigger, state, style, transition, animate } from '@angular/animations';

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

  constructor() { }

  ngOnInit() {
    // Subscribe to searchSubject and debounce the input events
    this.sub = this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.filterFilms();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @Input({required: true}) allFilms: any[] = [];
  @Input() excludedProperties: any[] = [];
  @Input() showFilterButton: boolean = false;
  @Input({required: true}) isOpen: boolean = false;

  @Output() newFilmsChange = new EventEmitter<any[]>();
  @Output() setOpenEvent = new EventEmitter<boolean>();
  @ViewChild('searchInput') searchInput?: IonInput; // Use optional chaining

  private searchSubject = new Subject<string>();
  searchQuery: string = '';
  sub: Subscription = new Subscription;

  // Method to emit the setOpenEvent
  emitSetOpen(isOpen: boolean) {
    this.setOpenEvent.emit(isOpen);
  }

  filterFilms() {
    if (!this.searchQuery) {
      // If search query is empty, show all films
      this.newFilmsChange.emit(this.allFilms);
    } else {
      // Filter films based on search query and excluded properties
      const filteredFilms = this.allFilms.filter(film =>
        Object.entries(film).some(([key, value]) => {
          if (this.excludedProperties.includes(key)) {
            return false; // Exclude the property from filtering
          }
          return (
            value && value.toString().toLowerCase().includes(this.searchQuery)
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
