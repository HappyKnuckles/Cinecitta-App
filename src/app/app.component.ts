import { Component, OnDestroy } from '@angular/core';
import { LoadingService } from './services/loader/loading.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { IonApp, IonBackdrop, IonSpinner, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    standalone: true,
    imports: [
        IonApp,
        NgIf,
        IonBackdrop,
        IonSpinner,
        IonRouterOutlet,
    ],
})
export class AppComponent implements OnDestroy {
    isLoading = false;
    private loadingSubscription: Subscription;

    constructor(private loadingService: LoadingService) {
        this.loadingSubscription = this.loadingService.isLoading$.subscribe(isLoading => {
            this.isLoading = isLoading;
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from the observable to prevent memory leaks
        this.loadingSubscription.unsubscribe();
    }
}
