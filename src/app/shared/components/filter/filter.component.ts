import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonFooter,
  IonDatetime
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, removeOutline, chevronUp, chevronDown } from 'ionicons/icons';
import * as Filtertags from 'src/app/core/models/filtertags';
import { StorageService } from 'src/app/core/services/storage/storage.service';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonFooter,
    IonDatetime
  ]
})
export class FilterComponent implements OnInit {
  @Input() isModalOpen = false;
  @Input() filmCount = 0;
  @Output() setOpenEvent = new EventEmitter<boolean>();
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() resetFilters = new EventEmitter<void>();

  selectedFilters = { ...Filtertags.selectedFilters };
  filters = Filtertags.filters;
  tageAuswahl = Filtertags.tageAuswahl;
  genresTag = Filtertags.genresTag;
  leinwandHighlights = Filtertags.leinwandHighlights;
  extras = Filtertags.extras;
  flags = Filtertags.flags;
  behindertenTags = Filtertags.behindertenTags;

  showStartTimePicker = false;
  showEndTimePicker = false;
  startTime = '10:00';
  endTime = '03:00';

  private readonly FILTER_STORAGE_KEY = 'cinema-filters';

  constructor(private storageService: StorageService) {
    addIcons({
      chevronBack,
      removeOutline,
      chevronUp,
      chevronDown
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadSavedFilters();
  }

  async loadSavedFilters(): Promise<void> {
    try {
      const savedFilters = await this.storageService.get(this.FILTER_STORAGE_KEY);
      if (savedFilters) {
        this.selectedFilters = { ...this.selectedFilters, ...savedFilters.filters };
        this.startTime = savedFilters.startTime || '10:00';
        this.endTime = savedFilters.endTime || '03:00';
      } else {
        // Set default values if no saved filters
        this.selectedFilters.tageAuswahl = [this.tageAuswahl[0].id];
        this.selectedFilters.leinwandHighlights = [this.leinwandHighlights[0].id];
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
      // Set default values on error
      this.selectedFilters.tageAuswahl = [this.tageAuswahl[0].id];
      this.selectedFilters.leinwandHighlights = [this.leinwandHighlights[0].id];
    }
  }

  async saveFilters(): Promise<void> {
    try {
      const filtersToSave = {
        filters: this.selectedFilters,
        startTime: this.startTime,
        endTime: this.endTime
      };
      await this.storageService.save(this.FILTER_STORAGE_KEY, filtersToSave);
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }

  setOpen(isOpen: boolean): void {
    this.setOpenEvent.emit(isOpen);
  }

  async onFilterChange(): Promise<void> {
    await this.saveFilters();
    this.filtersChanged.emit({
      selectedFilters: this.selectedFilters,
      startTime: this.startTime,
      endTime: this.endTime
    });
  }

  async onSingleSelectChange(value: any, filterType: string): Promise<void> {
    if (filterType === 'tageAuswahl' || filterType === 'leinwandHighlights') {
      this.selectedFilters[filterType] = [value];
    }
    await this.onFilterChange();
  }

  async reset(): Promise<void> {
    this.selectedFilters = {
      genresTags: [],
      tageAuswahl: [],
      leinwandHighlights: [],
      extras: [],
      flags: [],
      behindertenTags: []
    };
    this.startTime = '10:00';
    this.endTime = '03:00';
    
    await this.saveFilters();
    this.resetFilters.emit();
  }

  async confirm(): Promise<void> {
    await this.saveFilters();
    this.setOpen(false);
  }

  cancel(): void {
    this.setOpen(false);
  }

  openStartTimePicker(): void {
    this.showStartTimePicker = !this.showStartTimePicker;
  }

  openEndTimePicker(): void {
    this.showEndTimePicker = !this.showEndTimePicker;
  }

  closeTimes(): void {
    this.showStartTimePicker = false;
    this.showEndTimePicker = false;
  }

  async onTimeChange(): Promise<void> {
    await this.onFilterChange();
  }
}