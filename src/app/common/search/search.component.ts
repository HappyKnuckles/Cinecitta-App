import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { IonInput, IonIcon, IonButton, IonLabel } from '@ionic/angular/standalone';
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
import { WebscraperService } from 'src/app/services/scraper/webscraper.service';
import { LoadingService } from 'src/app/services/loader/loading.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { addIcons } from "ionicons";
import { search } from "ionicons/icons";
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Fuse from 'fuse.js';

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
    imports: [
        IonInput,
        FormsModule,
        IonIcon,
        NgIf,
        IonButton,
        IonLabel,
    ],
})
export class SearchComponent implements OnInit {
    @Input() formData!: FormData;
    @Input() isNewFilms = false;
    @Input() excludedProperties: any[] = [];
    @Input() showFilterButton = false;
    @Input({ required: true }) isOpen = false;

    @Output() newFilmsChange = new EventEmitter<any[]>();
    @Output() setOpenEvent = new EventEmitter<boolean>();
    @ViewChild('searchInput') searchInput?: IonInput;

    allFilms: any[] = [];
    private searchSubject = new Subject<string>();
    searchQuery = '';
    sub: Subscription = new Subscription();
    isLoading = false;
    private searchCache = new Map<string, any[]>();

    constructor(
        private filmData: FilmDataService,
        private filmRouter: FilmRoutService,
        private webScrapingService: WebscraperService,
        private loadingService: LoadingService,
        private storageService: StorageService
    ) {
        addIcons({ search });
    }

    async ngOnInit() {
        this.sub.add(
            this.searchSubject
                .pipe(debounceTime(300), distinctUntilChanged())
                .subscribe(() => {
                    this.filterFilms();
                })
        );

        await this.loadData(this.formData);
        if (!this.isNewFilms) {
            this.sub.add(
                this.filmRouter.currentFilmTitle.subscribe((title) => {
                    this.onSearchChange(title);
                })
            );
        }
    }

    async ngOnChanges(changes: SimpleChanges) {
        if (changes['formData'] && !changes['formData'].isFirstChange()) {
            await this.loadData(this.formData, true);
        }
    }

    async loadData(formData?: FormData, isReload?: boolean) {
        const cacheKey = this.isNewFilms ? 'newFilms' : 'allFilms';
        const maxAge = 12 * 60 * 60 * 1000; // 24 hours

        const cachedFilms = await this.storageService.getLocalStorage(cacheKey, maxAge);
        if (cachedFilms && !isReload) {
            this.allFilms = await cachedFilms;
            this.newFilmsChange.emit(this.allFilms);
            return;
        }

        try {
            this.loadingService.setLoading(true);
            if (!this.isNewFilms) {
                this.allFilms = await this.filmData.fetchFilmData(formData);
                await this.updateFilmData();
            } else {
                this.allFilms = await this.filmData.fetchNewFilms();
            }
            this.newFilmsChange.emit(this.allFilms);
        }
        catch (error) {
            console.log(error);
        }
        finally {
            this.loadingService.setLoading(false);
        }
        await this.storageService.setLocalStorage(cacheKey, this.allFilms);

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

    async filterFilms() {
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
                    .filter(key => !this.excludedProperties.includes(key) && key !== 'film_titel')
                    .map(key => ({ name: key, weight: 0.3 }))
            ],
            threshold: 0.3,
            ignoreLocation: true,
            minMatchCharLength: 3,
            includeMatches: true,
            includeScore: true,
            shouldSort: true,
            useExtendedSearch: false
        };

        const fuse = new Fuse(this.allFilms, options);
        const result = fuse.search(this.searchQuery);

        const filteredFilms = result.map(({ item }) => item);

        // Cache the result
        this.searchCache.set(this.searchQuery, filteredFilms);

        this.newFilmsChange.emit(filteredFilms);
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
