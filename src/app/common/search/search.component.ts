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
import { Network } from '@capacitor/network';
import { ToastService } from 'src/app/services/toast/toast.service';

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
    @Input() isReload = false;


    @Output() filmsChange = new EventEmitter<any[]>();
    @Output() setOpenEvent = new EventEmitter<boolean>();
    @ViewChild('searchInput') searchInput?: IonInput;

    allFilms: any[] = [];
    private searchSubject = new Subject<string>();
    searchQuery = '';
    sub: Subscription = new Subscription();
    isLoading = false;

    constructor(
        private filmData: FilmDataService,
        private filmRouter: FilmRoutService,
        private webScrapingService: WebscraperService,
        private loadingService: LoadingService,
        private storageService: StorageService,
        private toastService: ToastService
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

        await this.loadData(this.formData); console.log(this.allFilms)

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
            await this.loadData(this.formData, this.isReload);
        }
    }

    async loadData(formData?: FormData, isReload?: boolean) {
        let hashedFormData: string | undefined;
        if (formData) {
            const serializedFormData = this.serializeFormData(this.formData);
            hashedFormData = await this.hashString(serializedFormData);
        }
        const cacheKey = this.isNewFilms ? 'newFilms' : `allFilms_${hashedFormData ?? ''}`;
        const maxAge = 12 * 60 * 60 * 1000; // 24 hours
        const hasInternet = (await Network.getStatus()).connected;

        const cachedFilms = await this.storageService.getLocalStorage(cacheKey, maxAge);
        if ((cachedFilms && !isReload) || !hasInternet) {
            this.allFilms = await cachedFilms;
            this.filmsChange.emit(this.allFilms);
            if (!hasInternet) {
                this.toastService.showToast('No internet connection. Showing cached data. Data could be outdated!', 'alert-outline');
            }
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
            this.filmsChange.emit(this.allFilms);
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

    filterFilms() {
        if (!this.searchQuery) {
            this.filmsChange.emit(this.allFilms);
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
            this.filmsChange.emit(filteredFilms);
        }
    }

    //TODO Implement better filtering and fuse.js
    // async filterFilms() {
    //     if (!this.searchQuery) {
    //         this.newFilmsChange.emit(this.allFilms);
    //         return;
    //     }

    //     const lowerCaseQuery = this.searchQuery.toLowerCase();
    //     const keywords = lowerCaseQuery.split(' ').filter(keyword => keyword);

    //     const filteredFilms = this.allFilms
    //         .map((film: any) => {
    //             let matchScore = 0;

    //             for (const [key, value] of Object.entries(film)) {
    //                 if (this.excludedProperties.includes(key)) continue;

    //                 const stringValue = value ? value.toString().toLowerCase() : '';

    //                 for (const keyword of keywords) {
    //                     if (stringValue === keyword) {
    //                         // Exact match
    //                         matchScore += 3;
    //                     } else if (stringValue.startsWith(keyword)) {
    //                         // Starts with match
    //                         matchScore += 2;
    //                     } else if (stringValue.includes(keyword)) {
    //                         // Partial match
    //                         matchScore += 1;
    //                     }
    //                 }
    //             }

    //             return { film, matchScore };
    //         })
    //         .filter(({ matchScore }) => matchScore > 0)
    //         .sort((a, b) => b.matchScore - a.matchScore) // Sort by relevance
    //         .map(({ film }) => film);

    //     this.newFilmsChange.emit(filteredFilms);
    // }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    emitSetOpen(isOpen: boolean) {
        this.setOpenEvent.emit(isOpen);
    }

    serializeFormData(formData: FormData): string {
        const entries = [];
        for (const [key, value] of (formData as any).entries()) {
            entries.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
        return entries.join('&');
    }

    async hashString(str: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
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
