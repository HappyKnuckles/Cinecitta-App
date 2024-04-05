import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { SearchComponent } from 'src/app/common/search/search.component';
import { OpenWebsiteService } from 'src/app/services/website/open-website.service';
import { newFilm } from '../../models/filmModel';
import { FilmDataService } from 'src/app/services/film-data/film-data.service';
import * as Filtertags from '../../models/filtertags';
@Component({
  selector: 'app-newspage',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss']
})

export class NewsPage {
  newFilms: newFilm[] = [];
  showFull: boolean[] = [];
  isLoading: boolean = false;
  isSearchOpen: boolean = false;
  excluded = Filtertags.excludedFilmValues;
  

  @ViewChild(SearchComponent, { static: false }) searchInput!: SearchComponent;

  constructor(
    private website: OpenWebsiteService,
    private filmGetter: FilmDataService
  ) { }

  async ngOnInit() {
    await this.fetchNewFilms();
  }

  handleRefresh(event: any) {
    setTimeout(async () => {
      await this.fetchNewFilms();
      this.searchInput.clearInput();
      event.target.complete();
    }, 100);
  }

  openSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.searchInput.focusInput();
    } else {
      this.searchInput.blurInput();
    }
  }

  async openExternalWebsite(url: string) {
    try {
      await this.website.openExternalWebsite(url);
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }

  async fetchNewFilms() {
    this.isLoading = true;
    try {
      this.newFilms = await this.filmGetter.fetchNewFilms();
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
}