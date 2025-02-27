import { Component, OnInit } from '@angular/core';
import { LoadingService } from './services/loader/loading.service';
import { NgIf } from '@angular/common';
import { IonApp, IonBackdrop, IonSpinner, IonRouterOutlet, AlertController } from '@ionic/angular/standalone';
import { ToastComponent } from './common/toast/toast.component';
import { SwUpdate } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { StorageService } from './services/storage/storage.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, NgIf, IonBackdrop, IonSpinner, IonRouterOutlet, ToastComponent],
})
export class AppComponent implements OnInit {
  commitMessage: string = '';

  constructor(public loadingService: LoadingService, private sanitizer: DomSanitizer, private alertController: AlertController,
private swUpdate: SwUpdate, private http: HttpClient, private storageService: StorageService) {
    this.initializeApp();
  }

  async ngOnInit(): Promise<void> {
    await this.storageService.removeAllOldScrapeData();
  }

  private initializeApp(): void {
    this.swUpdate.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        const lastCommitDate = localStorage.getItem('lastCommitDate');
        const sinceParam = lastCommitDate ? `&since=${lastCommitDate}` : '';
        const apiUrl = `https://api.github.com/repos/HappyKnuckles/bowling-stats/commits?sha=master${sinceParam}`;

        // Fetch the latest commits from the master branch on GitHub
        this.http.get(apiUrl).subscribe({
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          next: async (data: any) => {
            const newCommits = [];

            for (const commit of data) {
              const commitDate = new Date(commit.commit.committer.date).toISOString();
              if (commitDate !== lastCommitDate) {
                newCommits.push(commit.commit.message);
              }
            }

            if (newCommits.length > 0) {
              const commitMessages = newCommits.map((msg) => `<li>${msg}</li>`).join('');
              const sanitizedMessage = this.sanitizer.sanitize(
                1,
                `<div class="commit-message"><ul>${commitMessages}</ul><br><span class="load-text">Load it?</span></div>`,
              );

              const alert = await this.alertController.create({
                backdropDismiss: false,
                header: 'New Version Available',
                subHeader: 'Following changes were made:',
                message: sanitizedMessage || '',
                buttons: [
                  {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                      localStorage.setItem('lastCommitDate', new Date(data[0].commit.committer.date).toISOString());
                      localStorage.setItem('update', 'true');
                    },
                  },
                  {
                    text: 'Load',
                    handler: () => {
                      localStorage.setItem('lastCommitDate', new Date(data[0].commit.committer.date).toISOString());
                      window.location.reload();
                    },
                  },
                ],
              });
              await alert.present();
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          error: async (error) => {
            console.error('Failed to fetch the latest commits:', error);
            const alert = await this.alertController.create({
              backdropDismiss: false,
              header: 'New Version Available',
              message: 'A new version is available. Load it?',
              buttons: [
                {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: () => {
                    localStorage.setItem('update', 'true');
                  },
                },
                {
                  text: 'Load',
                  handler: () => {
                    window.location.reload();
                  },
                },
              ],
            });
            await alert.present();
          },
        });
      }
    });
  }

}
