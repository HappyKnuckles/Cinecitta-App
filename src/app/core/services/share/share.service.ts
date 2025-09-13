import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';
import { Film, Theater, Leinwand } from '../../models/filmModel';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  constructor() {}

  async shareFilm(film: Film, startTime: string, endTime: string): Promise<void> {
    try {
      const shareText = this.generateShareText(film, startTime, endTime);
      
      await Share.share({
        title: `${film.film_titel} - Vorstellungszeiten`,
        text: shareText,
        url: film.filminfo_href || '',
        dialogTitle: `${film.film_titel} teilen`,
      });
    } catch (error) {
      console.error('Error sharing film:', error);
      throw error;
    }
  }

  private generateShareText(film: Film, startTime: string, endTime: string): string {
    let shareText = `🎬 ${film.film_titel}\n\n`;
    
    if (film.film_beschreibung) {
      // Extract and limit description
      const description = this.extractText(film.film_beschreibung);
      const limitedDescription = description.length > 150 ? 
        description.substring(0, 150) + '...' : description;
      shareText += `${limitedDescription}\n\n`;
    }

    if (film.film_dauer) {
      shareText += `⏱️ Dauer: ${this.transformTime(film.film_dauer)}\n`;
    }

    if (film.film_fsk) {
      shareText += `🔞 FSK: ${film.film_fsk}\n`;
    }

    shareText += `\n📅 Vorstellungszeiten (${startTime} - ${endTime}):\n\n`;

    // Group showtimes by theater and date
    const theaters = this.getTheatersWithShowtimes(film, startTime, endTime);
    
    theaters.forEach((theater) => {
      shareText += `🏛️ ${theater.theater_name}\n`;
      
      theater.leinwaende.forEach((leinwand) => {
        if (this.hasValidShowtimes(leinwand, startTime, endTime)) {
          shareText += `  📽️ ${leinwand.leinwand_name}\n`;
          
          // Group by weekday
          const showtimesByDay: { [key: string]: string[] } = {};
          
          leinwand.vorstellungen?.forEach((vorstellung) => {
            if (this.isWithinTimeRange(vorstellung.uhrzeit, startTime, endTime) && 
                !vorstellung.deaktiviert && !vorstellung.ausgegraut) {
              const dayKey = this.getDayName(vorstellung.tag_der_woche);
              if (!showtimesByDay[dayKey]) {
                showtimesByDay[dayKey] = [];
              }
              showtimesByDay[dayKey].push(vorstellung.uhrzeit);
            }
          });

          Object.keys(showtimesByDay).forEach((day) => {
            const times = showtimesByDay[day].sort().join(', ');
            shareText += `    ${day}: ${times}\n`;
          });
        }
      });
      shareText += '\n';
    });

    shareText += '🎭 Cinecitta App';
    
    return shareText;
  }

  private extractText(htmlString: string): string {
    // Remove HTML tags and decode entities
    return htmlString
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  private transformTime(duration: string): string {
    if (!duration) return '';
    
    const minutes = parseInt(duration, 10);
    if (isNaN(minutes)) return duration;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  }

  private getTheatersWithShowtimes(film: Film, startTime: string, endTime: string): Theater[] {
    return film.theater.filter((theater) => 
      theater.leinwaende.some((leinwand) => 
        this.hasValidShowtimes(leinwand, startTime, endTime)
      )
    );
  }

  private hasValidShowtimes(leinwand: Leinwand, startTime: string, endTime: string): boolean {
    return leinwand.vorstellungen?.some((vorstellung) => 
      this.isWithinTimeRange(vorstellung.uhrzeit, startTime, endTime) && 
      !vorstellung.deaktiviert && !vorstellung.ausgegraut
    ) ?? false;
  }

  private isWithinTimeRange(uhrzeit: string, startTime: string, endTime: string): boolean {
    const formattedEndTime = this.getFormattedEndTime(startTime, endTime);
    return startTime <= uhrzeit && formattedEndTime >= uhrzeit;
  }

  private getFormattedEndTime(startTime: string, endTime: string): string {
    const startHour = this.convertTimeToNumeric(startTime);
    let endHour = this.convertTimeToNumeric(endTime);
    
    // Ensure endHour is always at least one hour higher than startHour
    if (endHour <= startHour) {
      endHour = startHour + 1;
      if (endHour > 23) {
        endHour -= 24;
      }
    }
    
    return `${endHour.toString().padStart(2, '0')}:00`;
  }

  private convertTimeToNumeric(timeStr: string): number {
    const [hoursStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);
    
    let numericTime = hours;
    if (hours < 10) {
      numericTime += 24;
    }
    return numericTime;
  }

  private getDayName(tagDerWoche: string): string {
    const dayMap: { [key: string]: string } = {
      '1': 'Mo',
      '2': 'Di', 
      '3': 'Mi',
      '4': 'Do',
      '5': 'Fr',
      '6': 'Sa',
      '7': 'So'
    };
    return dayMap[tagDerWoche] || tagDerWoche;
  }
}