import { Component, ViewChildren, QueryList } from "@angular/core";
import { ImpactStyle } from "@capacitor/haptics";
import { IonRefresherContent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher } from "@ionic/angular/standalone";
import { HapticService } from "src/app/core/services/haptic/haptic.service";
import { LoadingService } from "src/app/core/services/loader/loading.service";
import { ToastService } from "src/app/core/services/toast/toast.service";
import { FilmSelectComponent } from "src/app/shared/components/film-select/film-select.component";
import * as Filtertags from "src/app/core/models/filtertags";
@Component({
  selector: 'app-tab1',
  templateUrl: 'start.page.html',
  styleUrls: ['start.page.scss'],
  standalone: true,
  imports: [IonRefresherContent, IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, FilmSelectComponent],
})
export class StartPage {
  @ViewChildren(FilmSelectComponent)
  filmSelectComponents!: QueryList<FilmSelectComponent>;
  genres = Filtertags.genresTag;
  flags = Filtertags.flags;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;

  constructor(
    public loadingService: LoadingService,
    private toastService: ToastService,
    private hapticService: HapticService
  ) { }

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
}
