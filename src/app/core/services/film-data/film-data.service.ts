import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { WebscraperService } from '../scraper/webscraper.service';
import { Film, Leinwand, NewFilm, Theater } from '../../models/film.model';

@Injectable({
  providedIn: 'root',
})
export class FilmDataService {
  url = 'https://proxy-server-rho-pearl.vercel.app/api/server';
  params = {
    bereich: 'portal',
    modul_id: '101',
    klasse: 'vorstellungen',
    cli_mode: '1',
    com: '',
  };
  filmData: Film[] = [];

  constructor(private http: HttpClient, private webScrapingService: WebscraperService) {}

  async fetchNewFilms(): Promise<NewFilm[]> {
    this.params.com = 'anzeigen_vorankuendigungen';
    const formData = new URLSearchParams();
    formData.append('filter[genres_tags_not][]', '185305');
    // formData.append('filter[extra][]', 'vorverkauf');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    try {
      const response: any = await firstValueFrom(
        this.http.post(this.url, formData.toString(), {
          params: this.params,
          headers: headers,
        })
      );

      return response?.daten?.items ?? [];
    } catch (error) {
      throw error;
    }
  }

  async fetchFilmData(formData?: FormData): Promise<Film[]> {
    this.params.com = 'anzeigen_spielplan';
    try {
      // Append the params as URL parameters
      const fullURL = `${this.url}?${new URLSearchParams(this.params).toString()}`;

      const formBody = this.formDataToUrlEncoded(formData);

      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      });
      if (response.ok) {
        const data = await response.json();
        this.filmData = data?.daten?.items;
        this.deleteLeinwandEntriesWithOVFlag();

        return this.filmData;
      } else {
        throw new Error(`HTTP Error: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  private deleteLeinwandEntriesWithOVFlag(): Film[] {
    try {
      // Track film titles that appear more than once
      const doubleFilms: Set<string> = new Set();
      const filmTitles: string[] = [];

      this.filmData.forEach((film: Film) => {
        if (filmTitles.includes(film.film_titel)) {
          doubleFilms.add(film.film_titel);
        } else {
          filmTitles.push(film.film_titel);
        }
      });

      // Delete leinwand entries for films appearing more than once and have different film_ist_ov values
      this.filmData.forEach((film: Film) => {
        if (doubleFilms.has(film.film_titel) && film.film_ist_ov === '0') {
          film.theater.forEach((theater: Theater) => {
            const leinwaende = theater.leinwaende.filter(
              (leinwand: Leinwand) => leinwand.release_flags && !leinwand.release_flags.some((flag: { flag_name: string }) => flag.flag_name === 'OV')
            );

            theater.leinwaende = leinwaende;
          });
        }
      });

      return this.filmData;
    } catch (error) {
      throw error;
    }
  }

  private formDataToUrlEncoded(formData: any): string {
    const formBody = [];
    for (const pair of formData.entries()) {
      const encodedKey = encodeURIComponent(pair[0]);
      const encodedValue = encodeURIComponent(pair[1]);
      formBody.push(`${encodedKey}=${encodedValue}`);
    }
    return formBody.join('&');
  }
}
