import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as cheerio from 'cheerio';
import { Observable, catchError, firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebscraperService {

  constructor(private http: HttpClient) { }

  async scrapeData(filmHref: any) {
    const proxyURL = "https://proxy-server-rho-pearl.vercel.app/api/server";
    try {
      const html = await fetch(`${proxyURL}?url=${filmHref}`).then((res) =>
        res.text()
      );
      const $ = cheerio.load(html);
      let filmData: any = {};
      filmData.trailerUrl = await this.getTrailerUrl($);
      filmData.duration = await this.getDuration($);
      filmData.fsk = await this.getFSK($);
      filmData.director = await this.getRegie($);
      filmData.darsteller = await this.getDarsteller($);
      filmData.tags = await this.getTags($);
      return filmData;
    } catch (error) {
      console.error("Error fetching Data:", error);
      return undefined;
    }
  }

  async getScriptContents($: any, keyword: any) {
    return $('script[type="text/javascript"]')
      .toArray()
      .map((script: any) => $(script).html())
      .filter((content: string | any[]) => content?.includes(keyword));
  }

  async extractDataFromScript(
    scriptContents: any,
    regex: RegExp,
    splitBy: any = null,
    decode = false,
    json = false
  ) {
    if (scriptContents.length === 0) {
      console.log("No matching" + scriptContents + "found");
      return;
    }

    const match = scriptContents[0]?.match(regex);

    if (!match || match.length <= 1) {
      console.log("No match with" + regex + "found");
      return;
    }

    let data = match[1];

    if (decode) {
      data = decodeURIComponent(data.replace(/\\\//g, "/"));
    }

    if (json) {
      try {
        const jsonData = JSON.parse(data);
        return jsonData.map((item: { text: any; }) => item.text);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return;
      }
    }

    if (splitBy) {
      const splitData = data.split(splitBy).map((name: string) => name.trim());
      return splitData.map((name: { split: (arg0: string) => [any, any]; }) => {
        const [vorname, nachname] = name.split(" ");
        return { vorname, nachname };
      });
    }

    return data;
  }

  async getTrailerUrl($: cheerio.CheerioAPI) {
    const scriptContents = await this.getScriptContents($, "var videos");
    return this.extractDataFromScript(
      scriptContents,
      /"video_url":"([^"]+)"/,
      null,
      true
    );
  }

  async getFSK($: cheerio.CheerioAPI) {
    const scriptContents = await this.getScriptContents($, "var filminfos");
    return this.extractDataFromScript(scriptContents, /"film_fsk":"(\d+)"/);
  }

  async getDuration($: cheerio.CheerioAPI) {
    const scriptContents = await this.getScriptContents($, "var filminfos");
    return this.extractDataFromScript(scriptContents, /"film_dauer":"(\d+)"/);
  }

  async getRegie($: cheerio.CheerioAPI) {
    const scriptContents = await this.getScriptContents($, "var filminfos");
    return this.extractDataFromScript(
      scriptContents,
      /"film_regisseure":"([^"]+)"/,
      ","
    );
  }

  async getDarsteller($: cheerio.CheerioAPI) {
    const scriptContents = await this.getScriptContents($, "var filminfos");
    return this.extractDataFromScript(
      scriptContents,
      /"film_darsteller":"([^"]+)"/,
      ","
    );
  }

  async getTags($: cheerio.CheerioAPI) {
    const scriptContents = await this.getScriptContents($, "var filminfos");
    return this.extractDataFromScript(
      scriptContents,
      /"film_tags":(\[[^\]]+\])/,
      null,
      false,
      true
    );
  }


}
