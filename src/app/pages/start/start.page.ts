import { Component, ViewChildren, QueryList } from "@angular/core";
import { ImpactStyle } from "@capacitor/haptics";
import { IonRefresherContent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, IonButton, IonIcon, IonModal, IonButtons, IonGrid, IonRow, IonCol, IonImg } from "@ionic/angular/standalone";
import { NgFor, NgIf } from "@angular/common";
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
  upcomingFavorites: NewFilm[] = [];
  currentFavorites: Film[] = [];

  constructor(
    public loadingService: LoadingService,
    private toastService: ToastService,
    private hapticService: HapticService,
    private favoritesService: FavoritesService,
    private filmDataService: FilmDataService
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
        console.log('Could not fetch current films data:', error);
      }

      try {
        // Try to fetch new films data
        newFilms = await this.filmDataService.fetchNewFilms();
      } catch (error) {
        console.log('Could not fetch new films data:', error);
      }

      const currentDate = new Date();
      
      // Process favorited films from current films
      for (const film of currentFilms) {
        if (favoriteIds.includes(film.system_id)) {
          // Check if film is upcoming based on release date
          const isUpcoming = this.isFilmUpcoming(film);
          if (isUpcoming) {
            // Convert Film to NewFilm format for upcoming
            const newFilm = this.convertFilmToNewFilm(film);
            this.upcomingFavorites.push(newFilm);
          } else {
            this.currentFavorites.push(film);
          }
        }
      }

      // Process favorited films from new films
      for (const film of newFilms) {
        if (favoriteIds.includes(film.system_id)) {
          this.upcomingFavorites.push(film);
        }
      }

      // If no films found from API, create mock data for favorited IDs
      if (currentFilms.length === 0 && newFilms.length === 0) {
        for (const id of favoriteIds) {
          const mockFilm = this.createMockFilm(id);
          this.upcomingFavorites.push(mockFilm);
        }
      }
      
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.toastService.showToast('Error loading favorites', 'alert-outline', true);
    }
  }

  private convertFilmToNewFilm(film: Film): NewFilm {
    return {
      system_id: film.system_id,
      film_titel: film.film_titel,
      film_beschreibung: film.film_beschreibung,
      film_cover_src: film.film_cover_src,
      filminfo_href: film.filminfo_href,
      film_ist_ov: film.film_ist_ov,
      filmchart_platzierung_aktuell: null,
      film_kurztext: film.film_teasertext || '',
      film_synopsis: film.film_synopsis || '',
      film_id: film.system_id,
      film_kurztitel: film.film_titel,
      film_haupttitel: film.film_titel,
      film_untertitel: '',
      film_original_titel: film.film_titel,
      film_schlagzeile: film.film_schlagzeile || '',
      film_teasertext: film.film_teasertext || '',
      film_moviedb_id: '',
      film_edis: film.film_edis || '',
      film_poster: film.film_cover_src,
      film_bundesstart_datum: film.film_bundesstart_datum || '',
      film_centerstart_zeit: film.film_centerstart_zeit || '',
      film_vorverkauf_zeit: film.film_vorverkauf_datum || '',
      film_bearbeitet: film.system_bearbeit_datum || '',
      film_dauer: film.film_dauer || '',
      film_fsk: film.film_fsk || '',
      film_jahr: film.film_jahr || '',
      film_website: film.film_website || '',
      film_produktionslaender: film.film_produktionslaender || '',
      film_original_sprache: film.film_original_sprache || '',
      film_distributoren: '',
      film_studios: film.film_studios || '',
      film_publisher: film.film_publisher || '',
      film_chartplatzierung_min: '',
      film_chartplatzierung_max: '',
      film_daten_sprache: film.film_daten_sprache || '',
      film_hauptfilm: film.film_hauptfilm || '',
      film_ist_archiviert: '',
      film_ist_geloescht: '',
      system_system_id: film.system_id,
      system_knoten_links: '',
      system_knoten_rechts: '',
      system_rechte_system_id: '',
      system_modul_id: '',
      system_klasse: '',
      system_trennung: '',
      system_fremd_id: '',
      system_root_system_id: '',
      system_name: '',
      system_sortierung: '',
      system_start_datum: '',
      system_ende_datum: '',
      system_status: '',
      system_flags: '',
      system_arbeitskopie_system_id: '',
      system_kategorien_system_id: '',
      system_erstell_login_id: '',
      system_erstell_datum: film.system_erstell_datum || '',
      system_bearbeit_login_id: '',
      system_bearbeit_datum: film.system_bearbeit_datum || '',
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
      filmchart_verkaufszahlen_aktuell: null,
      filmchart_platzierung_vorwoche: null,
      filmchart_verkaufszahlen_vorwoche: null,
      film_system_id: film.film_system_id || film.system_id,
      film_favored: film.film_favored || ''
    };
  }

  private createMockFilm(id: string): NewFilm {
    return {
      system_id: id,
      film_titel: `Film ${id}`,
      film_cover_src: 'https://via.placeholder.com/300x400/6c757d/ffffff?text=Film',
      film_centerstart_zeit: new Date().toLocaleDateString('de-DE'),
      film_beschreibung: `Beschreibung für Film ${id}`,
      film_ist_ov: '0',
      filminfo_href: '',
      film_kurztext: `Kurzbeschreibung für Film ${id}`,
      film_synopsis: `Synopsis für Film ${id}`,
      film_id: id,
      film_kurztitel: `Film ${id}`,
      film_haupttitel: `Film ${id}`,
      film_untertitel: '',
      film_original_titel: `Film ${id}`,
      film_schlagzeile: '',
      film_teasertext: '',
      film_moviedb_id: '',
      film_edis: '',
      film_poster: 'https://via.placeholder.com/300x400/6c757d/ffffff?text=Film',
      film_bundesstart_datum: '',
      film_vorverkauf_zeit: '',
      film_bearbeitet: '',
      film_dauer: '',
      film_fsk: '',
      film_jahr: '',
      film_website: '',
      film_produktionslaender: '',
      film_original_sprache: '',
      film_distributoren: '',
      film_studios: '',
      film_publisher: '',
      film_chartplatzierung_min: '',
      film_chartplatzierung_max: '',
      film_daten_sprache: '',
      film_hauptfilm: '',
      film_ist_archiviert: '',
      film_ist_geloescht: '',
      system_system_id: id,
      system_knoten_links: '',
      system_knoten_rechts: '',
      system_rechte_system_id: '',
      system_modul_id: '',
      system_klasse: '',
      system_trennung: '',
      system_fremd_id: '',
      system_root_system_id: '',
      system_name: '',
      system_sortierung: '',
      system_start_datum: '',
      system_ende_datum: '',
      system_status: '',
      system_flags: '',
      system_arbeitskopie_system_id: '',
      system_kategorien_system_id: '',
      system_erstell_login_id: '',
      system_erstell_datum: '',
      system_bearbeit_login_id: '',
      system_bearbeit_datum: '',
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
      film_system_id: id,
      film_favored: ''
    };
  }

  private isFilmUpcoming(film: Film | NewFilm): boolean {
    const currentDate = new Date();
    
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

      return releaseDate > currentDate;
    } catch (error) {
      console.log('Error parsing date:', releaseDateString, error);
      return false; // If parsing fails, assume current
    }
  }

  getFilmDescription(film: Film | NewFilm): string {
    // Try different description fields and extract text
    let description = '';
    
    if ('film_beschreibung' in film && film.film_beschreibung) {
      description = film.film_beschreibung;
    } else if ('film_kurztext' in film && film.film_kurztext) {
      description = film.film_kurztext;
    } else if ('film_teasertext' in film && film.film_teasertext) {
      description = film.film_teasertext;
    } else if ('film_synopsis' in film && film.film_synopsis) {
      description = film.film_synopsis;
    }

    if (!description) {
      return 'Keine Beschreibung verfügbar';
    }

    // Extract text content (remove HTML tags)
    const extractedText = description.replace(/<[^>]*>/g, '').trim();
    
    // Limit to 100 characters
    if (extractedText.length > 100) {
      return extractedText.slice(0, 100) + '...';
    }
    
    return extractedText;
  }
}
