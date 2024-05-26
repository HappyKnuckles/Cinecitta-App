import { Injectable } from '@angular/core';
import { Browser } from '@capacitor/browser';

@Injectable({
  providedIn: 'root'
})
export class OpenWebsiteService {

  constructor() { }

  async openExternalWebsite(url: string): Promise<void> {
    const options = {
      toolbarColor: '#1d979f', // Customize the browser toolbar color
    };
    const finishedUrl = 'https://cinecitta.' + url;

    try {
      await Browser.open({
        url: finishedUrl,
        windowName: '_self',
        toolbarColor: options.toolbarColor,
      });
    } catch (error) {
      console.error('Error opening external website: ' + error);
    }
  }
}
