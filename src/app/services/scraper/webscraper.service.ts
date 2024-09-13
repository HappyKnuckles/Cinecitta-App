import { Injectable } from '@angular/core';
import * as cheerio from 'cheerio';

@Injectable({
  providedIn: 'root',
})
export class WebscraperService {
  // TODO Define the return type of the functions
  async scrapeData(filmHref: any): Promise<any> {
    const proxyURL = 'https://proxy-server-rho-pearl.vercel.app/api/server';
    try {
      const html = await fetch(`${proxyURL}?url=${filmHref}`).then((res) =>
        res.text()
      );
      const $ = cheerio.load(html);
      let filmData: any = {};
      const filmInfoJson = await this.getFilmInfoJson($);
      const trailerUrl = await this.getTrailerUrl($);

      filmData = { ...filmData, ...filmInfoJson, ...trailerUrl };

      return filmData;
    } catch (error) {
      console.error('Error fetching Data:', error);
      return undefined;
    }
  }

  async getScriptContents($: any, keyword: any): Promise<any> {
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
  ): Promise<any> {
    if (scriptContents.length === 0) {
      // console.log("No matching" + scriptContents + "found");
      return;
    }

    const match = scriptContents[0]?.match(regex);

    if (!match || match.length <= 1) {
      // console.log("No match with" + regex + "found");
      return;
    }

    let data = match[1];

    data = data.replace(/\\u([\d\w]{4})/gi, function (match: any, grp: string) {
      return String.fromCharCode(parseInt(grp, 16));
    });

    if (decode) {
      data = decodeURIComponent(data.replace(/\\\//g, '/'));
    }

    if (json) {
      try {
        console.log(data);
        const jsonData = JSON.parse(data);
        console.log(jsonData);
        return jsonData.map((item: { text: any }) => item.text);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return;
      }
    }

    if (splitBy) {
      const splitData = data.split(splitBy).map((name: string) => name.trim());
      return splitData.map((name: { split: (arg0: string) => [any, any] }) => {
        const [vorname, nachname] = name.split(' ');
        return { vorname, nachname };
      });
    }

    return data;
  }

  async getTrailerUrl($: cheerio.CheerioAPI): Promise<any> {
    const scriptContents = await this.getScriptContents($, 'var videos');
    const trailerUrl = await this.extractDataFromScript(
      scriptContents,
      /"video_url":"([^"]+)"/,
      null,
      true
    );
    const trailerPreviewUrl = await this.extractDataFromScript(
      scriptContents,
      /"video_vorschau_pfad_bild":"([^"]+)"/,
      null,
      true
    );
    return { trailerUrl, trailerPreviewUrl };
  }

  async getFilmInfoJson($: cheerio.CheerioAPI): Promise<any> {
    const scriptContents = await this.getScriptContents($, 'var filminfos');
    const startIndex = scriptContents[0].indexOf('{');
    const endIndex = scriptContents[0].lastIndexOf('}') + 1;
    const jsonStr = scriptContents[0].substring(startIndex, endIndex);
    const json = JSON.parse(jsonStr);
    return json;
  }
}
