import { NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonPopover,
  IonImg,
  IonSkeletonText,
  IonContent,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';
import { Film, Leinwand, Theater } from 'src/app/core/models/film.model';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { OpenWebsiteService } from 'src/app/core/services/website/open-website.service';
import { ExtractTextPipe } from '../../pipes/extract-text/extract-text.pipe';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { FavoritesService } from 'src/app/core/services/favorites/favorites.service';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { TransformTimePipe } from '../../pipes/time-transformer/transform-time.pipe';
import { ImpactStyle } from '@capacitor/haptics';
import { DoubleTapDirective } from 'src/app/core/directives/double-tap/double-tap.directive';
import { Kino, KINOS } from 'src/app/core/models/kino';

@Component({
  selector: 'app-film-view-big',
  templateUrl: './film-view-big.component.html',
  styleUrls: ['./film-view-big.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonSkeletonText,
    TransformTimePipe,
    ExtractTextPipe,
    IonImg,
    NgFor,
    NgStyle,
    NgIf,
    IonPopover,
    IonIcon,
    IonButton,
    IonCol,
    IonRow,
    IonGrid,
    DoubleTapDirective,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
  ],
})
export class FilmViewBigComponent implements OnInit {
  loadingService = inject(LoadingService);
  content = input.required<IonContent>();
  startTime = input.required<string>();
  formattedEndTime = input.required<string>();
  i = input.required<number>();
  isTimesOpen = false;
  showTrailer = false;
  favoriteFilmIds = computed(() => new Set(this.favoritesService.favoriteFilms().map((film) => film.system_id || film.film_system_id)));
  selectedKino: Kino | null = null;
  isKinoModalOpen = false;
  kinos = KINOS;
  presentingElement!: HTMLElement | null;

  film = input.required<Film | null>();
  constructor(
    private website: OpenWebsiteService,
    private toastService: ToastService,
    private favoritesService: FavoritesService,
    private hapticService: HapticService
  ) { }

  ngOnInit(): void {
    this.presentingElement = document.querySelector('.ion-page');
  }

  async openExternalWebsite(url: string): Promise<void> {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }
  hasScreenings(film: Film): boolean {
    return film.theater.some((theater) => this.hasScreeningsForTheater(theater));
  }

  hasScreeningsForTheater(theater: Theater): boolean {
    return theater.leinwaende.some((leinwand) => this.hasScreeningsForLeinwand(leinwand));
  }

  hasScreeningsForLeinwand(leinwand: Leinwand): boolean {
    return leinwand.vorstellungen?.some((vorstellung) => this.isWithinTimeRange(vorstellung.uhrzeit)) ?? false;
  }

  isWithinTimeRange(uhrzeit: string): boolean {
    return this.startTime() <= uhrzeit && this.formattedEndTime() >= uhrzeit;
  }

  hasFlagName(leinwand: Leinwand, name: string): boolean {
    return leinwand.release_flags.some((flag: { flag_name: string }) => flag.flag_name === name);
  }
  showTrailers(film: Film): void {
    if (film.trailerUrl) {
      this.showTrailer = !this.showTrailer;
    } else {
      this.toastService.showToast(`Kein Trailer für ${film.film_titel} verfügbar`, 'bug', true);
    }
  }
  getColor(belegung_ampel: string): string {
    switch (belegung_ampel) {
      case 'gelb':
        return '#fc0';
      case 'orange':
        return '#f60';
      case 'rot':
        return '#c00';
      default:
        return '';
    }
  }

  async scrollToGrid(index: number): Promise<void> {
    const gridElement: HTMLElement | null = document.querySelector(`#gridRef-${index}`);
    if (gridElement) {
      const scrollElement: HTMLElement = await this.content().getScrollElement();
      const contentHeight = scrollElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const gridOffsetTop = gridElement.offsetTop;
      const gridHeight = gridElement.offsetHeight;

      let scrollPosition;
      if (gridHeight > windowHeight) {
        scrollPosition = gridOffsetTop;
      } else {
        scrollPosition = gridOffsetTop - (windowHeight - gridHeight) / 2;
        const maxScrollPosition = contentHeight - windowHeight;
        scrollPosition = Math.max(0, Math.min(scrollPosition, maxScrollPosition));
      }

      this.content().scrollToPoint(0, scrollPosition, 500);
    }
  }
  openTimes(i: number): void {
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    this.isTimesOpen = !this.isTimesOpen;
    if (this.isTimesOpen) {
      setTimeout(() => {
        this.scrollToGrid(i);
      }, 300);
    }
  }

  async toggleFavorite(event: Event, film: Film): Promise<void> {
    event.stopPropagation();
    this.hapticService.vibrate(ImpactStyle.Light, 100);
    await this.favoritesService.toggleFavorite(film);
  }

  openKinoModal(kinoName: string, theaterName: string): void {
    if(theaterName !== "CINECITTA'"){
      this.toastService.showToast(`Keine Informationen für ${kinoName} verfügbar`, 'information-circle', true);
      return;
    }
    const kino = this.kinos.find((k) => kinoName.includes(k.name));
    if (kino) {
      this.selectedKino = kino;
      this.isKinoModalOpen = true;
    } else {
      this.toastService.showToast(`Keine Informationen für ${kinoName} verfügbar`, 'information-circle', true);
    }
  }

  closeKinoModal(): void {
    this.isKinoModalOpen = false;
    this.selectedKino = null;
  }
}
