import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as cheerio from 'cheerio';
import { Observable, catchError, firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebscraperService {

  constructor(private http: HttpClient) { }

  async scrapeTrailerUrl(filmHref: string) {
    const proxyURL = 'https://proxy-server-rho-pearl.vercel.app/api/server';
  
    try {
      // Make a request to your proxy server with the filmHref as a parameter
      const html = await this.http.get(proxyURL, { params: { url: filmHref }, responseType: 'text' }).toPromise();
  
      // Load the HTML content into Cheerio
      const $ = cheerio.load(html!);
  
      // Find all script tags containing video data
      const scriptContents = $('script[type="text/javascript"]').toArray().map(script => $(script).html()).filter(content => content!.includes('var videos'));
  
      // Check if any script tag contains video data
      if (scriptContents.length > 0) {
        // Extract the video URL from the first script tag containing video data
        const videoUrlMatch = scriptContents[0]!.match(/"video_url":"([^"]+)"/);
        
        if (videoUrlMatch && videoUrlMatch.length > 1) {
          const trailerUrl = videoUrlMatch[1];
          console.log(trailerUrl)

          return decodeURIComponent(trailerUrl.replace(/\\\//g, '/'));;
        } else {
          console.error('Trailer URL not found in script tag.');
          return undefined;
        }
      } else {
        console.error('Script tag containing video data not found.');
        return undefined;
      }
    } catch (error) {
      console.error('Error fetching trailer URL:', error);
      return undefined;
    }
  }
  
}
