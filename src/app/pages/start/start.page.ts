import { Component, ViewChildren, QueryList } from "@angular/core";
import { ImpactStyle } from "@capacitor/haptics";
import { IonRefresherContent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonButton, IonIcon, IonModal, IonButtons, IonGrid, IonRow, IonCol, IonImg } from "@ionic/angular/standalone";
import { NgFor, NgIf } from "@angular/common";
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { heart, close } from 'ionicons/icons';
import { HapticService } from "src/app/core/services/haptic/haptic.service";
import { LoadingService } from "src/app/core/services/loader/loading.service";
import { ToastService } from "src/app/core/services/toast/toast.service";
import { FavoritesService } from "src/app/core/services/favorites/favorites.service";
import { FilmDataService } from "src/app/core/services/film-data/film-data.service";
import { FilmSelectComponent } from "src/app/shared/components/film-select/film-select.component";
import { Film, NewFilm } from "src/app/core/models/filmModel";
import { ExtractTextPipe } from "src/app/shared/pipes/extract-text/extract-text.pipe";
import * as Filtertags from "src/app/core/models/filtertags";
@Component({
  selector: 'app-tab1',
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss'],
  standalone: true,
  imports: [IonRefresherContent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonButton, IonIcon, IonModal, IonButtons, IonGrid, IonRow, IonCol, IonImg, NgFor, NgIf, FilmSelectComponent, ExtractTextPipe],
})
export class StartPage {
  @ViewChildren(FilmSelectComponent)
  filmSelectComponents!: QueryList<FilmSelectComponent>;
  genres = Filtertags.genresTag;
  flags = Filtertags.flags;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;

  isFavoritesModalOpen = false;
  favoriteFilms: Film[] = [];
  favoriteNewFilms: NewFilm[] = [];
  upcomingFavorites: (Film | NewFilm)[] = [];
  currentFavorites: (Film | NewFilm)[] = [];

  constructor(
    public loadingService: LoadingService,
    private toastService: ToastService,
    private hapticService: HapticService,
    private favoritesService: FavoritesService,
    private filmDataService: FilmDataService,
    private router: Router
  ) { 
    addIcons({ heart, close });
  }

  handleRefresh(event: any): void {
    this.hapticService.vibrate(ImpactStyle.Medium, 200);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => {
      await this.fetchDataForAllComponents(true);
      event.target.complete();
    }, 100);
  }

  async fetchDataForAllComponents(isReload?: boolean): Promise<void> {
    try {
      const loadPromises = this.filmSelectComponents.map((component) => component.loadData(isReload));
      const results = await Promise.all(loadPromises);

      if (results.some((result) => result === true)) {
        this.toastService.showToast('No internet connection. Showing cached data. Data could be outdated!', 'alert-outline');
      }
    } catch (error: any) {
      if (error.message === 'No internet connection') {
        this.toastService.showToast('Unable to load data. No internet connection.', 'alert-outline', true);
      }
      console.error(error);
      this.toastService.showToast('Error loading films. Try again later.', 'alert-outline', true);
    }
  }

  async openFavoritesModal(): Promise<void> {
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    await this.loadFavorites();
    this.isFavoritesModalOpen = true;
  }

  closeFavoritesModal(): void {
    this.isFavoritesModalOpen = false;
  }

  private async loadFavorites(): Promise<void> {
    try {
      // Get favorite film IDs from storage
      const favoriteIds = await this.favoritesService.getFavorites();
      
      // Clear previous favorites
      this.currentFavorites = [];
      this.upcomingFavorites = [];
      
      if (favoriteIds.length === 0) {
        return;
      }

      // Try to fetch current films and new films
      let currentFilms: Film[] = [];
      let newFilms: NewFilm[] = [];
      
      try {
        // Try to fetch current films data
        currentFilms = await this.filmDataService.fetchFilmData();
      } catch (error) {
        console.log('Could not fetch current films data, using fallback mock data:', error);
        // Fallback to mock data when API is blocked
        currentFilms = this.getMockCurrentFilms();
      }

      try {
        // Try to fetch new films data
        newFilms = await this.filmDataService.fetchNewFilms();
      } catch (error) {
        console.log('Could not fetch new films data, using fallback mock data:', error);
        // Fallback to mock data when API is blocked
        newFilms = this.getMockNewFilms();
      }
      
      // Process each favorite ID
      for (const favoriteId of favoriteIds) {
        let foundFilm = false;
        
        // First, search in current films (Film interface)
        const currentFilm = currentFilms.find(film => 
          film.system_id === favoriteId || 
          film.film_system_id === favoriteId
        );
        
        if (currentFilm) {
          foundFilm = true;
          // Determine if this film should be in upcoming or current based on its date
          const isUpcoming = this.isFilmUpcoming(currentFilm);
          if (isUpcoming) {
            this.upcomingFavorites.push(currentFilm as any); // Cast to handle interface compatibility
          } else {
            this.currentFavorites.push(currentFilm);
          }
        }
        
        // If not found in current films, search in new films (NewFilm interface)
        if (!foundFilm) {
          const newFilm = newFilms.find(film => 
            film.system_id === favoriteId || 
            film.film_system_id === favoriteId
          );
          
          if (newFilm) {
            foundFilm = true;
            // New films are typically upcoming, but let's check to be sure
            const isUpcoming = this.isFilmUpcoming(newFilm);
            if (isUpcoming) {
              this.upcomingFavorites.push(newFilm);
            } else {
              // If it's not upcoming, we need to convert it to Film format for current favorites
              this.currentFavorites.push(newFilm as any); // Cast to handle interface compatibility
            }
          }
        }
        
        // If film is still not found, it might be temporarily unavailable
        if (!foundFilm) {
          console.log(`Favorite film with ID ${favoriteId} not found in current data`);
          // Don't create mock films - just skip missing ones
          // The user can see which films are missing and re-favorite them if needed
        }
      }
      
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.toastService.showToast('Error loading favorites', 'alert-outline', true);
    }
  }



  private isFilmUpcoming(film: Film | NewFilm): boolean {
    const currentDate = new Date();
    // Set time to start of tomorrow for comparison - films from today should be "current"
    const todayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    
    // Try different date fields in order of preference
    let releaseDateString = '';
    
    if ('film_bundesstart_datum_iso' in film && film.film_bundesstart_datum_iso) {
      releaseDateString = film.film_bundesstart_datum_iso;
    } else if ('film_bundesstart_datum' in film && film.film_bundesstart_datum) {
      releaseDateString = film.film_bundesstart_datum;
    } else if ('film_centerstart_zeit' in film && film.film_centerstart_zeit) {
      releaseDateString = film.film_centerstart_zeit;
    }

    if (!releaseDateString) {
      return false; // No date available, assume current
    }

    try {
      // Try to parse the date string
      let releaseDate: Date;
      
      // Handle different date formats
      if (releaseDateString.includes('T') || releaseDateString.includes('Z')) {
        // ISO format
        releaseDate = new Date(releaseDateString);
      } else if (releaseDateString.includes('.')) {
        // German format DD.MM.YYYY
        const parts = releaseDateString.split('.');
        if (parts.length === 3) {
          releaseDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          releaseDate = new Date(releaseDateString);
        }
      } else {
        // Try default parsing
        releaseDate = new Date(releaseDateString);
      }

      // Film is upcoming only if it releases AFTER today (tomorrow or later)
      return releaseDate >= todayEnd;
    } catch (error) {
      return false; // If parsing fails, assume current
    }
  }

  getFilmDate(film: Film | NewFilm): string {
    // Try different date fields in order of preference
    let dateString = '';
    
    // For Film interface, prefer film_bundesstart_datum_iso first
    if ('film_bundesstart_datum_iso' in film && film.film_bundesstart_datum_iso) {
      dateString = film.film_bundesstart_datum_iso;
    } 
    // Common field in both interfaces
    else if ('film_bundesstart_datum' in film && film.film_bundesstart_datum) {
      dateString = film.film_bundesstart_datum;
    } 
    // For NewFilm interface, try film_centerstart_zeit
    else if ('film_centerstart_zeit' in film && film.film_centerstart_zeit) {
      dateString = film.film_centerstart_zeit;
    }

    if (!dateString) {
      return 'Datum nicht verfügbar';
    }

    try {
      // Try to format the date nicely
      let date: Date;
      
      if (dateString.includes('T') || dateString.includes('Z')) {
        // ISO format
        date = new Date(dateString);
      } else if (dateString.includes('.')) {
        // German format DD.MM.YYYY - already formatted
        return dateString;
      } else {
        // Try default parsing
        date = new Date(dateString);
      }

      // Format to German date format
      return date.toLocaleDateString('de-DE');
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  }

  getFilmImage(film: Film | NewFilm): string {
    // Try different image fields in order of preference
    if ('film_cover_src' in film && film.film_cover_src) {
      return film.film_cover_src;
    }
    if ('film_poster' in film && film.film_poster) {
      return film.film_poster;
    }
    return 'https://via.placeholder.com/300x400/6c757d/ffffff?text=Film';
  }

  getFilmDescription(film: Film | NewFilm): string {
    // Try different description fields and extract text
    let description = '';
    
    // For Film interface, check film_beschreibung first
    if ('film_beschreibung' in film && film.film_beschreibung) {
      description = film.film_beschreibung;
    }
    // For NewFilm interface, check film_kurztext first  
    else if ('film_kurztext' in film && film.film_kurztext) {
      description = film.film_kurztext;
    }
    // Common fields in both interfaces
    else if ('film_teasertext' in film && film.film_teasertext) {
      description = film.film_teasertext;
    } else if ('film_synopsis' in film && film.film_synopsis) {
      description = film.film_synopsis;
    }

    if (!description) {
      return 'Keine Beschreibung verfügbar';
    }

    // Use ExtractTextPipe to extract clean text content (remove HTML tags)
    const extractTextPipe = new ExtractTextPipe();
    const extractedText = extractTextPipe.transform(description).trim();
    
    // Limit to 100 characters
    if (extractedText.length > 100) {
      return extractedText.slice(0, 100) + '...';
    }
    
    return extractedText;
  }

  navigateToFilm(film: Film | NewFilm): void {
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    
    // Dismiss the modal first
    this.closeFavoritesModal();
    
    // Route to the appropriate page based on film release date
    const isUpcoming = this.isFilmUpcoming(film);
    if (isUpcoming) {
      // Route to news/demnächst page for upcoming films
      this.router.navigate(['/tabs/news'], { queryParams: { search: film.film_titel } });
    } else {
      // Route to film page for current films
      this.router.navigate(['/tabs/film'], { queryParams: { search: film.film_titel } });
    }
  }

  private getMockCurrentFilms(): Film[] {
    // Mirror the mock data from film page
    return [
      {
        system_id: 'film-mock1',
        film_system_id: 'film-mock1',
        film_titel: 'Spider-Man: No Way Home',
        film_beschreibung: 'Peter Parker seeks Doctor Strange to help make the world forget his identity as Spider-Man.',
        film_cover_src: 'https://via.placeholder.com/300x400/dc3545/ffffff?text=Spider-Man',
        film_centerstart_zeit: '15.12.2024',
        film_bundesstart_datum_iso: '2024-12-15',
        film_bundesstart_datum: '15.12.2024',
        filminfo_href: '#',
        film_ist_ov: '0',
        film_hauptfilm: '1',
        theater: [],
        film_teasertext: 'The web-slinger returns in an epic multiverse adventure.',
        film_synopsis: 'Peter Parker seeks Doctor Strange to help make the world forget his identity as Spider-Man.',
        film_dauer: '148',
        film_schlagzeile: 'Das Multiversum ist da!',
        film_website: '',
        film_produktionslaender: 'USA',
        film_jahr: '2021',
        film_edis: '',
        film_fsk: '12',
        film_darsteller: 'Tom Holland, Zendaya, Benedict Cumberbatch',
        film_regisseure: 'Jon Watts',
        film_produzenten: 'Kevin Feige',
        film_komponisten: 'Michael Giacchino',
        film_autoren: 'Chris McKenna, Erik Sommers',
        film_studios: 'Marvel Studios',
        film_publisher: 'Sony Pictures',
        film_daten_sprache: 'de',
        film_original_sprache: 'en',
        film_favored: '0',
        film_centerstart_zeit_iso: '2024-12-15T00:00:00Z',
        film_vorverkauf_datum: '',
        film_tags: [],
        main_film_sprache: 'Deutsch',
        film_daten_sprache_text: 'Deutsch',
        film_pressezitate: [],
        film_wochentage: [],
        vorstellungen_anzahl_tage: {},
        system_erstell_datum: '2024-01-01',
        system_bearbeit_datum: '2024-01-01'
      } as Film,
      {
        system_id: 'film-mock2',
        film_system_id: 'film-mock2',
        film_titel: 'Dune: Part Two',
        film_beschreibung: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.',
        film_cover_src: 'https://via.placeholder.com/300x400/f39c12/ffffff?text=Dune',
        film_centerstart_zeit: '01.03.2024',
        film_bundesstart_datum_iso: '2024-03-01',
        film_bundesstart_datum: '01.03.2024',
        filminfo_href: '#',
        film_ist_ov: '1',
        film_hauptfilm: '1',
        theater: [],
        film_teasertext: 'The epic continues on the desert planet.',
        film_synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family.',
        film_dauer: '166',
        film_schlagzeile: 'Das Epos geht weiter!',
        film_website: '',
        film_produktionslaender: 'USA',
        film_jahr: '2024',
        film_edis: '',
        film_fsk: '12',
        film_darsteller: 'Timothée Chalamet, Zendaya, Rebecca Ferguson',
        film_regisseure: 'Denis Villeneuve',
        film_produzenten: 'Mary Parent, Cale Boyter',
        film_komponisten: 'Hans Zimmer',
        film_autoren: 'Denis Villeneuve, Jon Spaihts',
        film_studios: 'Legendary Entertainment',
        film_publisher: 'Warner Bros.',
        film_daten_sprache: 'de',
        film_original_sprache: 'en',
        film_favored: '0',
        film_centerstart_zeit_iso: '2024-03-01T00:00:00Z',
        film_vorverkauf_datum: '',
        film_tags: [],
        main_film_sprache: 'Englisch',
        film_daten_sprache_text: 'Deutsch',
        film_pressezitate: [],
        film_wochentage: [],
        vorstellungen_anzahl_tage: {},
        system_erstell_datum: '2024-01-01',
        system_bearbeit_datum: '2024-01-01'
      } as Film
    ];
  }

  private getMockNewFilms(): NewFilm[] {
    // Mirror the mock data from news page
    return [
      {
        system_id: 'news-mock1',
        film_system_id: 'news-mock1',
        film_titel: 'The Batman 2',
        film_beschreibung: 'The Dark Knight returns in this highly anticipated sequel.',
        film_cover_src: 'https://via.placeholder.com/300x400/343a40/ffffff?text=Batman+2',
        film_centerstart_zeit: '15.06.2025',
        film_bundesstart_datum: '15.06.2025',
        filminfo_href: '#',
        film_ist_ov: '0',
        filmchart_platzierung_aktuell: '1',
        film_kurztext: 'Batman faces new challenges in Gotham City.',
        film_synopsis: 'Full synopsis of The Batman 2...',
        film_teasertext: 'The Dark Knight returns in this highly anticipated sequel.',
        film_poster: 'https://via.placeholder.com/300x400/343a40/ffffff?text=Batman+2',
        film_id: 'news-mock1',
        film_kurztitel: 'The Batman 2',
        film_haupttitel: 'The Batman 2',
        film_untertitel: '',
        film_original_titel: 'The Batman Part II',
        film_schlagzeile: 'Der Dunkle Ritter kehrt zurück',
        film_moviedb_id: '',
        film_edis: '',
        film_bearbeitet: '2024-01-01',
        film_dauer: '155',
        film_fsk: '12',
        film_jahr: '2025',
        film_website: '',
        film_produktionslaender: 'USA',
        film_original_sprache: 'en',
        film_distributoren: 'Warner Bros.',
        film_studios: 'DC Films',
        film_publisher: 'Warner Bros.',
        film_chartplatzierung_min: '',
        film_chartplatzierung_max: '',
        film_daten_sprache: 'de',
        film_hauptfilm: '1',
        film_ist_archiviert: '0',
        film_ist_geloescht: '0',
        system_system_id: 'news-mock1',
        system_knoten_links: '',
        system_knoten_rechts: '',
        system_rechte_system_id: '',
        system_modul_id: '101',
        system_klasse: 'vorstellungen',
        system_trennung: '',
        system_fremd_id: '',
        system_root_system_id: '',
        system_name: 'The Batman 2',
        system_sortierung: '1',
        system_start_datum: '2025-06-15',
        system_ende_datum: '',
        system_status: 'aktiv',
        system_flags: '',
        system_arbeitskopie_system_id: '',
        system_kategorien_system_id: '',
        system_erstell_login_id: '',
        system_erstell_datum: '2024-01-01',
        system_bearbeit_login_id: '',
        system_bearbeit_datum: '2024-01-01',
        system_wochentage: '',
        bild_id: '',
        bild_kategorie_id: '',
        bild_name: '',
        bild_format: '',
        bild_pfad_bild: '',
        bild_datum: '',
        bild_beschreibung: '',
        bild_ist_standard: '',
        bild_download_pfad: '',
        bild_download_zeit: '',
        bild_extern_id: '',
        bild_referenz_id: '',
        bild_typ_id: '',
        filmchart_id: null,
        filmchart_film: null,
        filmchart_platzierung_aktuell: '1',
        filmchart_verkaufszahlen_aktuell: null,
        filmchart_platzierung_vorwoche: null,
        filmchart_verkaufszahlen_vorwoche: null,
        film_favored: '0',
        film_vorverkauf_zeit: ''
      } as NewFilm,
      {
        system_id: 'news-mock2',
        film_system_id: 'news-mock2',
        film_titel: 'Avatar 3',
        film_beschreibung: 'Jake Sully and Neytiri continue their journey on Pandora.',
        film_cover_src: 'https://via.placeholder.com/300x400/17a2b8/ffffff?text=Avatar+3',
        film_centerstart_zeit: '20.12.2025',
        film_bundesstart_datum: '20.12.2025',
        filminfo_href: '#',
        film_ist_ov: '1',
        filmchart_platzierung_aktuell: '2',
        film_kurztext: 'The next chapter in the Avatar saga.',
        film_synopsis: 'Full synopsis of Avatar 3...',
        film_teasertext: 'Jake Sully and Neytiri continue their journey on Pandora.',
        film_poster: 'https://via.placeholder.com/300x400/17a2b8/ffffff?text=Avatar+3',
        film_id: 'news-mock2',
        film_kurztitel: 'Avatar 3',
        film_haupttitel: 'Avatar 3',
        film_untertitel: '',
        film_original_titel: 'Avatar: Fire and Ash',
        film_schlagzeile: 'Die Saga geht weiter',
        film_moviedb_id: '',
        film_edis: '',
        film_bearbeitet: '2024-01-01',
        film_dauer: '180',
        film_fsk: '12',
        film_jahr: '2025',
        film_website: '',
        film_produktionslaender: 'USA',
        film_original_sprache: 'en',
        film_distributoren: '20th Century Studios',
        film_studios: 'Lightstorm Entertainment',
        film_publisher: '20th Century Studios',
        film_chartplatzierung_min: '',
        film_chartplatzierung_max: '',
        film_daten_sprache: 'de',
        film_hauptfilm: '1',
        film_ist_archiviert: '0',
        film_ist_geloescht: '0',
        system_system_id: 'news-mock2',
        system_knoten_links: '',
        system_knoten_rechts: '',
        system_rechte_system_id: '',
        system_modul_id: '101',
        system_klasse: 'vorstellungen',
        system_trennung: '',
        system_fremd_id: '',
        system_root_system_id: '',
        system_name: 'Avatar 3',
        system_sortierung: '2',
        system_start_datum: '2025-12-20',
        system_ende_datum: '',
        system_status: 'aktiv',
        system_flags: '',
        system_arbeitskopie_system_id: '',
        system_kategorien_system_id: '',
        system_erstell_login_id: '',
        system_erstell_datum: '2024-01-01',
        system_bearbeit_login_id: '',
        system_bearbeit_datum: '2024-01-01',
        system_wochentage: '',
        bild_id: '',
        bild_kategorie_id: '',
        bild_name: '',
        bild_format: '',
        bild_pfad_bild: '',
        bild_datum: '',
        bild_beschreibung: '',
        bild_ist_standard: '',
        bild_download_pfad: '',
        bild_download_zeit: '',
        bild_extern_id: '',
        bild_referenz_id: '',
        bild_typ_id: '',
        filmchart_id: null,
        filmchart_film: null,
        filmchart_platzierung_aktuell: '2',
        filmchart_verkaufszahlen_aktuell: null,
        filmchart_platzierung_vorwoche: null,
        filmchart_verkaufszahlen_vorwoche: null,
        film_favored: '0',
        film_vorverkauf_zeit: ''
      } as NewFilm,
      {
        system_id: 'news-mock3',
        film_system_id: 'news-mock3',
        film_titel: 'Fast & Furious 11',
        film_beschreibung: 'The family returns for one last ride.',
        film_cover_src: 'https://via.placeholder.com/300x400/28a745/ffffff?text=F%26F+11',
        film_centerstart_zeit: '10.07.2025',
        film_bundesstart_datum: '10.07.2025',
        filminfo_href: '#',
        film_ist_ov: '0',
        filmchart_platzierung_aktuell: null,
        film_kurztext: 'The final chapter in the Fast & Furious saga.',
        film_synopsis: 'Full synopsis of Fast & Furious 11...',
        film_teasertext: 'The family returns for one last ride.',
        film_poster: 'https://via.placeholder.com/300x400/28a745/ffffff?text=F%26F+11',
        film_id: 'news-mock3',
        film_kurztitel: 'Fast & Furious 11',
        film_haupttitel: 'Fast & Furious 11',
        film_untertitel: '',
        film_original_titel: 'Fast X: Part 2',
        film_schlagzeile: 'Ein letztes Mal',
        film_moviedb_id: '',
        film_edis: '',
        film_bearbeitet: '2024-01-01',
        film_dauer: '142',
        film_fsk: '12',
        film_jahr: '2025',
        film_website: '',
        film_produktionslaender: 'USA',
        film_original_sprache: 'en',
        film_distributoren: 'Universal Pictures',
        film_studios: 'Original Film',
        film_publisher: 'Universal Pictures',
        film_chartplatzierung_min: '',
        film_chartplatzierung_max: '',
        film_daten_sprache: 'de',
        film_hauptfilm: '1',
        film_ist_archiviert: '0',
        film_ist_geloescht: '0',
        system_system_id: 'news-mock3',
        system_knoten_links: '',
        system_knoten_rechts: '',
        system_rechte_system_id: '',
        system_modul_id: '101',
        system_klasse: 'vorstellungen',
        system_trennung: '',
        system_fremd_id: '',
        system_root_system_id: '',
        system_name: 'Fast & Furious 11',
        system_sortierung: '3',
        system_start_datum: '2025-07-10',
        system_ende_datum: '',
        system_status: 'aktiv',
        system_flags: '',
        system_arbeitskopie_system_id: '',
        system_kategorien_system_id: '',
        system_erstell_login_id: '',
        system_erstell_datum: '2024-01-01',
        system_bearbeit_login_id: '',
        system_bearbeit_datum: '2024-01-01',
        system_wochentage: '',
        bild_id: '',
        bild_kategorie_id: '',
        bild_name: '',
        bild_format: '',
        bild_pfad_bild: '',
        bild_datum: '',
        bild_beschreibung: '',
        bild_ist_standard: '',
        bild_download_pfad: '',
        bild_download_zeit: '',
        bild_extern_id: '',
        bild_referenz_id: '',
        bild_typ_id: '',
        filmchart_id: null,
        filmchart_film: null,
        filmchart_platzierung_aktuell: null,
        filmchart_verkaufszahlen_aktuell: null,
        filmchart_platzierung_vorwoche: null,
        filmchart_verkaufszahlen_vorwoche: null,
        film_favored: '0',
        film_vorverkauf_zeit: ''
      } as NewFilm
    ];
  }
}
