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

  async scrapeOcupationData(id: string): Promise<any> {    
    const destination = 'https://proxy-server-rho-pearl.vercel.app/api/vorstellung';
    const url = `${destination}?id=${id}`;
    const data = localStorage.getItem(`sitzplan-${id}`);
    if (data) {
      const parsedData = JSON.parse(data);
      return {
        html: parsedData.html.html,
        css: parsedData.html.css
      };
    }
    try {
      const response = await fetch(url);
      if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem(`sitzplan-${id}`, JSON.stringify(data));
        return {
          html: data.html.html,
          css: data.html.css
        };
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
