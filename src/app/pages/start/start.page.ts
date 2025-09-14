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
        console.log('Could not fetch current films data:', error);
      }

      try {
        // Try to fetch new films data
        newFilms = await this.filmDataService.fetchNewFilms();
      } catch (error) {
        console.log('Could not fetch new films data:', error);
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
    
    // Route to the appropriate page based on film release date
    const isUpcoming = this.isFilmUpcoming(film);
    if (isUpcoming) {
      // Route to news/demnächst page for upcoming films
      this.router.navigate(['/tabs/news'], { queryParams: { search: film.film_titel } });
    } else {
      // Route to film page for current films
      this.router.navigate(['/tabs/film'], { queryParams: { search: film.film_titel } });
    }
    
    this.closeFavoritesModal();
  }
}
