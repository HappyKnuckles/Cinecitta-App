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
        // Fetch the commit message from the file
        this.http.get('assets/commit-message.txt', { responseType: 'text' })
        .subscribe({
          next: (message: string) => {
            this.commitMessage = message;
          },
          error: (error) => {
            console.error('Failed to fetch commit message:', error);
          },
          complete: () => {
            console.log('Commit message fetched successfully');
          }
        });
      
    
        // Listen for version updates and prompt the user
        this.swUpdate.versionUpdates.subscribe(event => {
          if (event.type === 'VERSION_READY') {
            if (confirm(`A new version is available. Changes: ${this.commitMessage}. Load it?`)) {
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
