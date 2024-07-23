import { AfterViewInit, Component, QueryList, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loader/loading.service';
import * as Filtertags from '../../models/filtertags';
import { FilmRoutService } from 'src/app/services/film-rout/film-rout.service';
import { Router } from '@angular/router';
import { FilmSelectComponent } from 'src/app/common/film-select/film-select.component';
@Component({
  selector: 'app-tab1',
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss']
})
export class StartPage implements AfterViewInit {
  @ViewChildren(FilmSelectComponent) filmSelectComponents!: QueryList<FilmSelectComponent>;
  private loadingSubscription: Subscription;
  isLoading = false;
  genres = Filtertags.genresTag;
  flags = Filtertags.flags;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;

  constructor(
    private loadingService: LoadingService,
    private filmRouter: FilmRoutService,
    private router: Router
  ) {
    this.loadingSubscription = this.loadingService.isLoading$.subscribe(isLoading => {
      this.isLoading = isLoading;
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.fetchDataForAllComponents();
  }

  ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }

  handleRefresh(event: any): void {
    setTimeout(async () => {
      await this.fetchDataForAllComponents();
      event.target.complete();
    }, 100);
  }

  onFilmClick(film: any): void {
    this.filmRouter.changeFilmTitle(film.film_titel);
    this.router.navigate(['/tabs/film']);
  }

  async fetchDataForAllComponents(): Promise<void> {
    this.loadingService.setLoading(true);
    try {
      const loadPromises = this.filmSelectComponents.map(component => component.loadData());
      await Promise.all(loadPromises);
    }
    catch (error) {
      console.log(error)
    }
    finally { this.loadingService.setLoading(false); }
  }

}
