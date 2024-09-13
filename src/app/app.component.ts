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
        // First, fetch the commit message from the file
        this.http.get('assets/commit-message.txt', { responseType: 'text' })
          .subscribe({
            next: (message: string) => {
              this.commitMessage = message;
              // Now listen for version updates only after the commit message is fetched
              this.checkForUpdates();
            },
            error: (error) => {
              console.error('Failed to fetch commit message:', error);
              // Even in case of error, we want to proceed with checking for updates
              this.checkForUpdates(); // Proceed with checking for updates without commit message
            },
            complete: () => {
              console.log('Commit message fetched successfully');
            }
          });
      }
      
      checkForUpdates(): void {
        // Listen for version updates and prompt the user
        this.swUpdate.versionUpdates.subscribe(event => {
          if (event.type === 'VERSION_READY') {
            if (confirm(`A new version is available. Changes: ${this.commitMessage || 'No commit message found'}. Load it?`)) {
              window.location.reload();
            }
          }
        });
      }      

    ngOnDestroy(): void {
        // Unsubscribe from the observable to prevent memory leaks
        this.loadingSubscription.unsubscribe();
    }
}
