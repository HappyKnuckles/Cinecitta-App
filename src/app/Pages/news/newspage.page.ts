import { Component, ViewChild } from '@angular/core';
import { SearchComponent } from 'src/app/common/search/search.component';
import { OpenWebsiteService } from 'src/app/services/website/open-website.service';
import { newFilm } from '../../models/filmModel';
import * as Filtertags from '../../models/filtertags';
import { LoadingService } from 'src/app/services/loader/loading.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-newspage',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss']
})

export class NewsPage {
  newFilms: newFilm[] = [];
  showFull: boolean[] = [];
  isLoading = false;
  private loadingSubscription: Subscription;
  isSearchOpen = false;
  excluded = Filtertags.excludedFilmValues;


  @ViewChild(SearchComponent, { static: false }) searchComponent!: SearchComponent;

  constructor(
    private website: OpenWebsiteService,
    private loadingService: LoadingService
  ) {
    this.loadingSubscription = this.loadingService.isLoading$.subscribe(isLoading => {
      this.isLoading = isLoading;
    });
  }

  ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }

  handleRefresh(event: any): void {
    setTimeout(async () => {
      if (this.searchComponent) {
        await this.searchComponent.loadData();
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