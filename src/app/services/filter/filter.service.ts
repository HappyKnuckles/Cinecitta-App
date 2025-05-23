import { computed, Injectable, signal, Signal, OnInit, effect } from '@angular/core';
import { Filter } from 'src/app/models/filtertags';
import { FilmDataService } from '../film-data/film-data.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  defaultFilters: Filter = {
    genresTags: [],
    tageAuswahl: [''],
    leinwandHighlights: [171984],
    extras: [],
    flags: [],
    behindertenTags: [],
    startTime: '10:00',
    endTime: '03:00',
  }

  activeFilterCount: Signal<number> = computed(() => {
    return Object.keys(this.filters()).reduce((count, key) => {
      const filterValue = this.filters()[key as keyof Filter];
      const defaultValue = this.defaultFilters[key as keyof Filter];
      if (Array.isArray(filterValue) && Array.isArray(defaultValue)) {
        if (!this.areArraysEqual(filterValue, defaultValue)) {
          return count + 1;
        }
      } else if (filterValue !== defaultValue) {
        return count + 1;
      }
      return count;
    }, 0);
  });

  #filteredFilms = computed(async () => {
    const formData = this.formData();
    return await this.filterFilms(formData);
  })

  get filteredFilms() {
    return this.#filteredFilms;
  }

  formData = computed(() => {
    console.log('formData computed IS RE-EVALUATING NOW'); // <-- ADD THIS LOG

    const currentFilters = this.#filters();
    const formData = new FormData();

    formData.append('get_filter_aktiv', 'false');
    formData.append('filter[ovfilme]', '0');

    // Append selected filters to the form data
    currentFilters.genresTags.forEach((id: number) => formData.append('filter[genres_tags][]', id.toString()));

    if (currentFilters.leinwandHighlights.length > 0) {
      // Assuming leinwandHighlights is an array of numbers and you want the first one
      formData.append('filter[leinwand_highlight]', currentFilters.leinwandHighlights[0].toString());
    }

    if (currentFilters.tageAuswahl.length > 0 && currentFilters.tageAuswahl[0]) {
      // Assuming tageAuswahl is an array of strings and you want the first one
      formData.append('filter[tage_auswahl]', currentFilters.tageAuswahl[0]);
    }

    currentFilters.extras.forEach((extra: string) => formData.append('filter[extra][]', extra));
    currentFilters.flags.forEach((id: number) => formData.append('filter[releasetypen_flags][]', id.toString()));
    currentFilters.behindertenTags.forEach((id: number) => formData.append('filter[barrierefrei_tags][]', id.toString()));

    // Assuming convertTimeToNumeric is a method in this service
    const startTimeNumeric = this.convertTimeToNumeric(currentFilters.startTime);
    const endTimeNumeric = this.convertTimeToNumeric(currentFilters.endTime);
    formData.append('filter[rangeslider][]', String(startTimeNumeric));
    formData.append('filter[rangeslider][]', String(endTimeNumeric));

    return formData;
  });

  #filters = signal<Filter>({...this.defaultFilters});

  get filters() {
    return this.#filters;
  }
  constructor(private filmDataService: FilmDataService) {  
    this.filters.set(this.setDefaultFilters());
 }

  setDefaultFilters() {
    const storedFilter = localStorage.getItem('filter');
    return storedFilter ? JSON.parse(storedFilter) : {...this.defaultFilters};  
  }

  saveFilters(){
    localStorage.setItem('filter', JSON.stringify(this.filters()));
  }

  resetFilters() {
    this.filters.update(() => ({...this.defaultFilters}));
  }

  async filterFilms(formData: FormData){
    console.log('filterFilms called with formData:', formData);
    return await this.filmDataService.fetchFilmData(formData);
  }

  convertTimeToNumeric(timeStr: string): number {
    // Split the time string into hours and minutes
    const [hoursStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);

    // Convert the time to numeric representation
    let numericTime = hours;

    // Special case: If the time is below 10 add 24
    if (hours < 10) {
      numericTime += 24;
    }
    return numericTime;
  }

  areArraysEqual(arr1: unknown[], arr2: unknown[]): boolean {
    if (arr1.length !== arr2.length) {
      return false;
    }
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();
    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }
}
