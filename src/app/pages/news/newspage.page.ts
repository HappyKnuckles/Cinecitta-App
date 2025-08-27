import { NgIf, NgFor } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { IonRefresherContent, IonSkeletonText, IonText, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent, IonRefresher, IonGrid, IonRow, IonImg, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { OpenWebsiteService } from 'src/app/core/services/website/open-website.service';
import { FilmStateService } from 'src/app/core/services/film-state/film-state.service';
import { UIStateService } from 'src/app/core/services/ui-state/ui-state.service';
import { SearchComponent } from 'src/app/shared/components/search/search.component';
import { ExtractTextPipe } from 'src/app/shared/pipes/extract-text/extract-text.pipe';
import * as Filtertags from 'src/app/core/models/filtertags';
@Component({
  selector: 'app-newspage',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss'],
  standalone: true,
  imports: [IonRefresherContent,
    IonSkeletonText,
    NgIf,
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    SearchComponent,
    IonContent,
    IonRefresher,
    NgFor,
    IonGrid,
    IonRow,
    IonImg,
    IonCol,
    ExtractTextPipe,
  ],
})
export class NewsPage {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild(SearchComponent, { static: false }) searchComponent!: SearchComponent;
  
  excluded = Filtertags.excludedFilmValues;

  // Computed properties from services
  newFilms = this.filmStateService.newFilms;
  isSearchOpen = this.uiStateService.isSearchOpen;
  showFull = this.uiStateService.showFull;

  constructor(
    private website: OpenWebsiteService,
    public loadingService: LoadingService,
    private hapticService: HapticService,
    private filmStateService: FilmStateService,
    public uiStateService: UIStateService
  ) {
    addIcons({ search });
  }

  handleRefresh(event: any): void {
    this.hapticService.vibrate(ImpactStyle.Medium, 200);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setTimeout(async () => {
      if (this.searchComponent) {
        await this.searchComponent.loadData(undefined, true);
      }
      this.searchComponent.clearInput();
      event.target.complete();
    }, 100);
  }

  openSearch(): void {
    const isCurrentlyOpen = this.isSearchOpen();
    this.uiStateService.setSearchOpen(!isCurrentlyOpen);
    if (!isCurrentlyOpen) {
      this.searchComponent.focusInput();
    } else {
      this.searchComponent.blurInput();
    }
  }

  search($event: any): void {
    // Update films from search component  
    // The centralized service is already updated, just trigger reactivity
    this.content.scrollToTop(300);
  }

  async openExternalWebsite(url: string): Promise<void> {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }
}
