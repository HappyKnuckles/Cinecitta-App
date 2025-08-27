import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy, input, effect } from '@angular/core';
import { IonInput, IonIcon, IonButton, IonSearchbar } from '@ionic/angular/standalone';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { filterOutline, filter, search } from 'ionicons/icons';
import { FilmStateService } from 'src/app/core/services/film-state/film-state.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { SearchBlurDirective } from 'src/app/core/directives/search-blur/search-blur.directive';

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
  standalone: true,
  imports: [FormsModule, IonIcon, NgIf, IonButton, IonSearchbar, NgStyle, SearchBlurDirective],
})
export class SearchComponent implements OnInit, OnDestroy {
  formData = input<FormData>();
  @Input() isNewFilms = false;
  @Input() excludedProperties: any[] = [];
  @Input() showFilterButton = false;
  @Input({ required: true }) isOpen = false;
  @Input() isReload = false;
  @Output() newFilmsChange = new EventEmitter<any[]>();
  @Output() setOpenEvent = new EventEmitter<boolean>();
  @ViewChild('searchInput') searchInput?: IonInput;

  private searchSubject = new Subject<string>();
  searchQuery = '';
  sub: Subscription = new Subscription();

  constructor(
    private filmStateService: FilmStateService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    addIcons({ filterOutline, filter, search });

    // Effect to load data when form data changes
    effect(() => {
      this.loadData(this.formData(), this.isReload);
    }, { allowSignalWrites: true });

    // Effect to emit films when they change  
    effect(() => {
      const films = this.isNewFilms ? this.filmStateService.newFilms() : this.filmStateService.filteredFilms();
      // Use setTimeout to avoid change detection issues
      setTimeout(() => {
        this.newFilmsChange.emit(films);
      }, 0);
    });

    // Effect to sync search query from service to component
    effect(() => {
      const serviceSearchQuery = this.filmStateService.searchQuery();
      if (this.searchQuery !== serviceSearchQuery) {
        this.searchQuery = serviceSearchQuery;
      }
    });
  }

  async ngOnInit() {
    this.sub.add(
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((query) => {
        this.filmStateService.search(query, this.excludedProperties);
      })
    );

    await this.loadData(this.formData());

    if (!this.isNewFilms) {
      this.route.queryParams.pipe(distinctUntilChanged()).subscribe((params) => {
        if (params['search']) {
          this.onSearchChange(params['search']);

          // Clear the search query parameter
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { search: null },
            queryParamsHandling: 'merge'
          });
        }
      }
      );
    }
  }

  async loadData(formData?: FormData, isReload?: boolean) {
    try {
      if (this.isNewFilms) {
        await this.filmStateService.loadNewFilms(isReload || false);
      } else {
        await this.filmStateService.loadFilms(formData, isReload || false, this.excludedProperties);
      }
    } catch (error) {
      console.error(error);
      this.toastService.showToast('Error loading films. Try again later.', 'alert-outline', true);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  emitSetOpen(isOpen: boolean) {
    this.setOpenEvent.emit(isOpen);
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
    this.filmStateService.clearSearch();
  }
}
