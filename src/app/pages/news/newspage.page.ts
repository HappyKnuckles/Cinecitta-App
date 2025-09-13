import { NgIf, NgFor } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { IonRefresherContent, IonSkeletonText, IonText, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent, IonRefresher, IonGrid, IonRow, IonImg, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { NewFilm } from 'src/app/core/models/filmModel';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { OpenWebsiteService } from 'src/app/core/services/website/open-website.service';
import { SearchComponent } from 'src/app/shared/components/search/search.component';
import { FavoriteButtonComponent } from 'src/app/shared/components/favorite-button/favorite-button.component';
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
    FavoriteButtonComponent,
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
  newFilms: NewFilm[] = [];
  showFull: boolean[] = [];
  isSearchOpen = false;
  excluded = Filtertags.excludedFilmValues;

  @ViewChild(SearchComponent, { static: false })
  searchComponent!: SearchComponent;

  constructor(private website: OpenWebsiteService, public loadingService: LoadingService, private hapticService: HapticService) {
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
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.searchComponent.focusInput();
    } else {
      this.searchComponent.blurInput();
    }
  }

  search(event: any): void {
    this.newFilms = event;
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
