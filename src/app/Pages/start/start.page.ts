import { AfterViewInit, Component, QueryList, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loader/loading.service';
import * as Filtertags from '../../models/filtertags';
import { FilmRoutService } from 'src/app/services/film-rout/film-rout.service';
import { Router } from '@angular/router';
import { FilmSelectComponent } from 'src/app/common/film-select/film-select.component';
import { FilmSelectComponent as FilmSelectComponent_1 } from '../../common/film-select/film-select.component';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher } from '@ionic/angular/standalone';
import { Network } from '@capacitor/network';
import { ToastService } from 'src/app/services/toast/toast.service';
import { HapticService } from 'src/app/services/haptic/haptic.service';
import { ImpactStyle } from '@capacitor/haptics';
@Component({
	selector: 'app-tab1',
	templateUrl: 'start.page.html',
	styleUrls: ['start.page.scss'],
	standalone: true,
	imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonRefresher, FilmSelectComponent_1]
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
		private router: Router,
		private toastService: ToastService,
		private hapticService: HapticService
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
		this.hapticService.vibrate(ImpactStyle.Medium, 200);
		setTimeout(async () => {
			await this.fetchDataForAllComponents(true);
			event.target.complete();
		}, 100);
	}

	onFilmClick(film: any): void {
		this.filmRouter.changeFilmTitle(film.film_titel);
		this.router.navigate(['/tabs/film']);
	}

	async fetchDataForAllComponents(isReload?: boolean): Promise<void> {
		this.loadingService.setLoading(true);

		try {
			const loadPromises = this.filmSelectComponents.map(component => component.loadData(isReload));
			const results = await Promise.all(loadPromises);

			if (results.some(result => result === true)) {
				this.toastService.showToast('No internet connection. Showing cached data. Data could be outdated!', 'alert-outline');
			}
		}
		catch (error: any) {
			if (error.message === 'No internet connection') {
				this.toastService.showToast('Unable to load data. No internet connection.', 'alert-outline', true);
			}
			console.log(error)
		}
		finally { this.loadingService.setLoading(false); }
	}
}
