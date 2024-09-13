import { Component, OnDestroy } from '@angular/core';
import { LoadingService } from './services/loader/loading.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { IonApp, IonBackdrop, IonSpinner, IonRouterOutlet } from '@ionic/angular/standalone';
import { ToastComponent } from './common/toast/toast.component';
import { SwUpdate } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';

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
        ToastComponent
    ],
})
export class AppComponent implements OnDestroy {
    isLoading = false;
    commitMessage: string = '';
    private loadingSubscription: Subscription;

    constructor(private loadingService: LoadingService, private swUpdate: SwUpdate, private http: HttpClient) {
        this.initializeApp();
        this.loadingSubscription = this.loadingService.isLoading$.subscribe(isLoading => {
            this.isLoading = isLoading;
        });
    }

    initializeApp(): void {
      // Listen for version updates and prompt the user
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          // Fetch the latest commit from GitHub
          this.http
            .get('https://api.github.com/repos/HappyKnuckles/Cine-App/commits/master')
            .subscribe({
              next: (data: any) => {
                // Extract the commit message from the API response
                this.commitMessage = data.commit.message;
                if (confirm(`A new version is available. Changes: ${this.commitMessage}. Load it?`)) {
                  window.location.reload();
                }
              },
              error: (error) => {
                console.error('Failed to fetch the latest commit:', error);
                if (confirm('A new version is available. Load it?')) {
                  window.location.reload();
                }
              },
            });
        }
      });
    }  

    ngOnDestroy(): void {
        // Unsubscribe from the observable to prevent memory leaks
        this.loadingSubscription.unsubscribe();
    }
}
