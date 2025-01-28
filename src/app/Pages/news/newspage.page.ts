import { Component, ViewChild } from '@angular/core';
import { SearchComponent } from 'src/app/common/search/search.component';
import { OpenWebsiteService } from 'src/app/services/website/open-website.service';
import { newFilm } from '../../models/filmModel';
import * as Filtertags from '../../models/filtertags';
import { LoadingService } from 'src/app/services/loader/loading.service';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { ExtractTextPipe } from '../../Pipes/extract-text/extract-text.pipe';
import { SearchComponent as SearchComponent_1 } from '../../common/search/search.component';
import {
  IonText,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonContent,
  IonRefresher,
  IonGrid,
  IonRow,
  IonImg,
  IonCol,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { NgIf, NgFor } from '@angular/common';
import { HapticService } from 'src/app/services/haptic/haptic.service';
import { ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-newspage',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss'],
  standalone: true,
  imports: [
    IonSkeletonText,
    NgIf,
    IonText,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon,
    SearchComponent_1,
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
  newFilms: newFilm[] = [];
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

  async openExternalWebsite(url: string): Promise<void> {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }
}
