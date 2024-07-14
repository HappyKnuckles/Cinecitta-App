import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Film } from 'src/app/models/filmModel';
import { FilmDataService } from 'src/app/services/film-data/film-data.service';
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
  @ViewChild('filmSelect0') filmSelectComponent0!: FilmSelectComponent;
  @ViewChild('filmSelect1') filmSelectComponent1!: FilmSelectComponent;
  @ViewChild('filmSelect2') filmSelectComponent2!: FilmSelectComponent;
  @ViewChild('filmSelect3') filmSelectComponent3!: FilmSelectComponent;
  @ViewChild('filmSelect4') filmSelectComponent4!: FilmSelectComponent;
  private loadingSubscription: Subscription;
  isLoading: boolean = false;
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

  async ngAfterViewInit() {
    await this.fetchDataForAllComponents();
  }

  ngOnDestroy() {
    this.loadingSubscription.unsubscribe();
  }

  onFilmClick(film: any) {
    this.filmRouter.changeFilmTitle(film.film_titel);
    this.router.navigate(['/tabs/film']);
  }

  async fetchDataForAllComponents(): Promise<void> {
    this.loadingService.setLoading(true);
    try {
      await Promise.all([
        this.filmSelectComponent0.loadData(),
        this.filmSelectComponent1.loadData(),
        this.filmSelectComponent2.loadData(),
        this.filmSelectComponent3.loadData(),
        this.filmSelectComponent4.loadData(),
      ]);
    }
    catch (error) {
      console.log(error)
    }
    finally { this.loadingService.setLoading(false); }
  }

}
