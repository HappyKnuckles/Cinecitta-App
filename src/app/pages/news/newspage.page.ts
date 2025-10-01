import { NgIf, NgFor } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { IonRefresherContent, IonText, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonContent, IonRefresher, IonGrid, IonButtons } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search, heart, heartOutline } from 'ionicons/icons';
import { ActivatedRoute } from '@angular/router';
import { NewFilm } from 'src/app/core/models/filmModel';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { LoadingService } from 'src/app/core/services/loader/loading.service';
import { SearchComponent } from 'src/app/shared/components/search/search.component';
import * as Filtertags from 'src/app/core/models/filtertags';
import { FilmViewMediumComponent } from "src/app/shared/components/film-view-medium/film-view-medium.component";
@Component({
  selector: 'app-newspage',
  templateUrl: 'newspage.page.html',
  styleUrls: ['newspage.page.scss'],
  standalone: true,
  imports: [IonButtons, IonRefresherContent,
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
    FilmViewMediumComponent],
})
export class NewsPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  newFilms: NewFilm[] = [];
  isSearchOpen = false;
  excluded = Filtertags.excludedFilmValues;

  @ViewChild(SearchComponent, { static: false })
  searchComponent!: SearchComponent;

  constructor(
    public loadingService: LoadingService, 
    private hapticService: HapticService,
    private route: ActivatedRoute,
  ) {
    addIcons({ search, heart, heartOutline });
  }

  ngOnInit(): void {
    // Subscribe to query parameters to handle search input from navigation
    this.route.queryParams.subscribe((params) => {
      if (params['search']) {
        this.isSearchOpen = true;
        // Wait for the search component to be ready, then set the search value
        setTimeout(() => {
          if (this.searchComponent) {
            this.searchComponent.setSearchValue(params['search']);
          }
        }, 100);
      }
    });
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
}
