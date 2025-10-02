import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy, input, effect } from '@angular/core';
import { IonInput, IonIcon, IonButton, IonSearchbar } from '@ionic/angular/standalone';
import { debounceTime, distinctUntilChanged, map, filter, Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Fuse from 'fuse.js';
import { addIcons } from 'ionicons';
import { filterOutline, search } from 'ionicons/icons';
import { FilmDataService } from 'src/app/core/services/film-data/film-data.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { WebscraperService } from 'src/app/core/services/scraper/webscraper.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { Network } from '@capacitor/network';
import { SearchBlurDirective } from 'src/app/core/directives/search-blur/search-blur.directive';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon, NgIf, IonButton, IonSearchbar, NgStyle, SearchBlurDirective],
})
export class SearchComponent implements OnInit, OnDestroy {
  formData = input<FormData>();
  @Input() isNewFilms = false;
  @Input() excludedProperties: any[] = [];
  @Input() showFilterButton = false;
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
    private router: Router,
    private location: Location
  ) {
    addIcons({ filterOutline, search });

    effect(() => {
      const currentFormData = this.formData();
      // Guard clause: Do not proceed if formData is not yet available.
      if (!currentFormData && !this.isNewFilms) {
        return;
      }

      (async () => {
        await this.loadData(currentFormData, this.isReload);
        // After data is loaded based on formData, apply the current text search.
        this.filterFilms();
      })();
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.sub.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(() => {
        this.filterFilms();
      })
    );

    if (!this.isNewFilms) {
      this.sub.add(
        this.route.queryParams.pipe(
          map(params => params['search']?.trim().toLowerCase() ?? ''),
          filter(search => search.length > 0),
          distinctUntilChanged()
        ).subscribe((search) => {
          this.searchQuery = search;
          this.filterFilms();

          const url = this.location.path().split('?')[0];
          this.location.replaceState(url);
        })
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
      const serializedFormData = this.serializeFormData(formData);
      hashedFormData = await this.hashString(serializedFormData);
    }
    const cacheKey = this.isNewFilms ? 'newFilms' : `allFilms_${hashedFormData ?? ''}`;
    const maxAge = 12 * 60 * 60 * 1000; // 12 hours

    const cachedFilms = await this.storageService.getLocalStorage(cacheKey, maxAge, hasInternet);
    if ((cachedFilms && !isReload) || !hasInternet) {
      this.allFilms = await cachedFilms;
      if (!hasInternet) {
        this.toastService.showToast('No internet connection. Showing cached data. Data could be outdated!', 'alert-outline');
      }
      this.loadingService.setLoading(false);
      return;
    }

    try {
      if (!this.isNewFilms) {
        this.allFilms = await this.filmData.fetchFilmData(formData);
        await this.updateFilmData();
      } else {
        this.allFilms = await this.filmData.fetchNewFilms();
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

  setSearchValue(value: string) {
    this.searchQuery = value;
    this.searchSubject.next(this.searchQuery);
  }

  private filterFilms() {
    if (!this.searchQuery) {
      this.newFilmsChange.emit(this.allFilms);
      return;
    }

    if (this.searchCache.has(this.searchQuery)) {
      this.newFilmsChange.emit(this.searchCache.get(this.searchQuery)!);
      return;
    }

    // Ensure allFilms has data before trying to access properties of its first element
    if (!this.allFilms || this.allFilms.length === 0) {
      this.newFilmsChange.emit([]);
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
      }
    });

    await Promise.all(filmPromises);
  }
}