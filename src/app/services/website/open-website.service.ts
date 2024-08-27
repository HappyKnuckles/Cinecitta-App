import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { isPlatform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class OpenWebsiteService {

  async openExternalWebsite(url: string): Promise<void> {
    const options = {
      toolbarColor: '#1d979f',
    };
    let target = '_self';
    const finishedUrl = 'https://cinecitta.' + url;

    if (isPlatform('desktop') || isPlatform('mobileweb')) {
      target = '_blank';
      window.open(finishedUrl, target);
    } else {
      try {
        await Browser.open({
          url: finishedUrl,
          windowName: target,
          toolbarColor: options.toolbarColor,
        });
      } catch (error) {
        console.error('Error opening external website: ' + error);
      }
    }
  }
}
