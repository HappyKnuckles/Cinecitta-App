import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingService } from './services/loader/loading.service';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';
import { IonApp, IonBackdrop, IonSpinner, IonRouterOutlet } from '@ionic/angular/standalone';
import { ToastComponent } from './common/toast/toast.component';
import { SwUpdate } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './services/storage/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, NgIf, IonBackdrop, IonSpinner, IonRouterOutlet, ToastComponent],
})
export class AppComponent implements OnDestroy, OnInit {
  isLoading = false;
  commitMessage: string = '';
  private loadingSubscription: Subscription;

  constructor(private loadingService: LoadingService, private swUpdate: SwUpdate, private http: HttpClient, private storageService: StorageService) {
    this.initializeApp();
    this.loadingSubscription = this.loadingService.isLoading$.subscribe((isLoading) => {
      this.isLoading = isLoading;
    });
  }

  async ngOnInit(): Promise<void> {
    await this.storageService.removeAllOldScrapeData();
  }

  initializeApp(): void {
    // Listen for version updates and prompt the user
    this.swUpdate.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        const lastCommitDate = localStorage.getItem('lastCommitDate');
        const sinceParam = lastCommitDate ? `&since=${lastCommitDate}` : '';
        const apiUrl = `https://api.github.com/repos/HappyKnuckles/Cine-App/commits?sha=master${sinceParam}`;

        // Fetch the latest commits from the master branch on GitHub
        this.http.get(apiUrl).subscribe({
          next: (data: any) => {
            const newCommits = [];

            for (const commit of data) {
              const commitDate = new Date(commit.commit.committer.date).toISOString();
              if (commitDate !== lastCommitDate) {
                newCommits.push(commit.commit.message);
              }
            }

            if (newCommits.length > 0) {
              const commitMessages = newCommits.join('\n');
              if (confirm(`New Version Available. Load it?\n\nChanges:\n${commitMessages}`)) {
                localStorage.setItem('lastCommitDate', new Date(data[0].commit.committer.date).toISOString());
                window.location.reload();
              }
            }
          },
          error: (error) => {
            console.error('Failed to fetch the latest commits:', error);
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
