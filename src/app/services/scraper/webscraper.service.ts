import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class WebscraperService {
  // TODO Define the return type of the functions
  async scrapeData(filmHref: any, storageService: StorageService): Promise<any> {
    const filmData = await storageService.get(filmHref);
    if (filmData) {
      if (filmData.expirationDate > new Date()) {
        return filmData;
      }
    }

    const destination = 'https://web-scraper-zeta.vercel.app/api/scraper';
    const url = `${destination}?url=${filmHref}`;

    try {
      const response = await fetch(url);
      if (response.status === 200) {
        const data = await response.json();

        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 6);
        const savedData = { ...data, expirationDate };
        await storageService.save(filmHref, savedData);

        return data;
      } else {
        console.error('Error fetching Data: Status', response.status);
        return undefined;
      }
    } catch (error) {
      console.error('Error fetching Data:', error);
      return undefined;
    }
  }
}
