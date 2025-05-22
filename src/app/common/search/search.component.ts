import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy, input, effect } from '@angular/core';
import { IonInput, IonIcon, IonButton, IonSearchbar } from '@ionic/angular/standalone';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FilmDataService } from 'src/app/services/film-data/film-data.service';
import { WebscraperService } from 'src/app/services/scraper/webscraper.service';
import { LoadingService } from 'src/app/services/loader/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { addIcons } from 'ionicons';
import { search, filter, filterOutline } from 'ionicons/icons';
import { NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Fuse from 'fuse.js';
import { Network } from '@capacitor/network';
import { ToastService } from 'src/app/services/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  imports: [FormsModule, IonIcon, NgIf, IonButton, IonSearchbar, NgStyle],
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

  allFilms: any[] = [];
  private searchSubject = new Subject<string>();
  searchQuery = '';
  sub: Subscription = new Subscription();
  private searchCache = new Map<string, any[]>();

  constructor(
    private filmData: FilmDataService,
    private webScrapingService: WebscraperService,
    private loadingService: LoadingService,
    private storageService: StorageService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router

  ) {
    addIcons({ filterOutline, filter, search });

    effect(() => {
      this.loadData(this.formData(), this.isReload);
    }, { allowSignalWrites: true })
  }

  async ngOnInit() {
    this.sub.add(
      this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
        this.filterFilms();
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
    this.loadingService.setLoading(true);
    const hasInternet = (await Network.getStatus()).connected;
    if (!hasInternet && isReload) {
      this.toastService.showToast('Unable to load data. No internet connection.', 'alert-outline', true);
      this.loadingService.setLoading(false);

      return;
    }

    let hashedFormData: string | undefined;
    if (formData) {
      const serializedFormData = this.serializeFormData(this.formData()!);
      hashedFormData = await this.hashString(serializedFormData);
    }
    const cacheKey = this.isNewFilms ? 'newFilms' : `allFilms_${hashedFormData ?? ''}`;
    const maxAge = 12 * 60 * 60 * 1000; // 24 hours

    const cachedFilms = await this.storageService.getLocalStorage(cacheKey, maxAge, hasInternet);
    if ((cachedFilms && !isReload) || !hasInternet) {
      this.allFilms = await cachedFilms;
      this.newFilmsChange.emit(this.allFilms);
      if (!hasInternet) {
        this.toastService.showToast('No internet connection. Showing cached data. Data could be outdated!', 'alert-outline');
      }
      this.loadingService.setLoading(false);

      return;
    }

    try {
      if (!this.isNewFilms) {
        this.allFilms = await this.filmData.fetchFilmData(formData);
        this.newFilmsChange.emit(this.allFilms);
        this.loadingService.setLoading(false);

        await this.updateFilmData();
      } else {
        this.allFilms = await this.filmData.fetchNewFilms();
        this.newFilmsChange.emit(this.allFilms);
      }
    } catch (error) {
      console.error(error);
      this.toastService.showToast('Error loading films. Try again later.', 'alert-outline', true);
    } finally {
      this.loadingService.setLoading(false);
    }
    await this.storageService.setLocalStorage(cacheKey, this.allFilms);
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
    this.searchSubject.next(this.searchQuery);
  }

  private filterFilms() {
    if (!this.searchQuery) {
      this.newFilmsChange.emit(this.allFilms);
      return;
    }
    // Check cache first
    if (this.searchCache.has(this.searchQuery)) {
      this.newFilmsChange.emit(this.searchCache.get(this.searchQuery)!);
      return;
    }
    const options = {
      keys: [
        { name: 'film_titel', weight: 0.7 },
        ...Object.keys(this.allFilms[0])
          .filter((key) => !this.excludedProperties.includes(key) && key !== 'film_titel')
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

    const fuse = new Fuse(this.allFilms, options);
    const result = fuse.search(this.searchQuery);

    const filteredFilms = result.map(({ item }: { item: any }) => item);

    // Cache the result
    this.searchCache.set(this.searchQuery, filteredFilms);

    this.newFilmsChange.emit(filteredFilms);
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

  private async updateFilmData(): Promise<void> {
    const filmPromises = this.allFilms.map(async (film, index) => {
      if (film.filminfo_href !== undefined) {
        const filmContent = await this.webScrapingService.scrapeData(film.filminfo_href, this.storageService);
        this.allFilms[index] = { ...film, ...filmContent };
        this.newFilmsChange.emit(this.allFilms);
      }
    });

    await Promise.all(filmPromises);
  }
}
