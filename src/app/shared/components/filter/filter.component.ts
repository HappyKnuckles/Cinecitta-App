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
  PickerController
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
    IonFooter
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

  startTime = '10:00';
  endTime = '03:00';

  private readonly FILTER_STORAGE_KEY = 'cinema-filters';

  constructor(private storageService: StorageService, private pickerController: PickerController) {
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
      // Ensure time logic is applied after loading
      this.ensureTimeLogic();
    } catch (error) {
      console.error('Error loading saved filters:', error);
      // Set default values on error
      this.selectedFilters.tageAuswahl = [this.tageAuswahl[0].id];
      this.selectedFilters.leinwandHighlights = [this.leinwandHighlights[0].id];
      // Ensure time logic is applied even on error
      this.ensureTimeLogic();
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
      tageAuswahl: '',
      leinwandHighlights: 171984,
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

  async openStartTimePicker(): Promise<void> {
    const timeOptions = this.generateTimeOptions();
    const selectedIndex = timeOptions.findIndex(option => option.value === this.startTime);

    const picker = await this.pickerController.create({
      columns: [
        {
          name: 'time',
          options: timeOptions,
          selectedIndex: selectedIndex >= 0 ? selectedIndex : 0
        }
      ],
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Bestätigen',
          handler: (value) => {
            this.startTime = value.time.value;
            this.onTimeChange();
          }
        }
      ]
    });

    await picker.present();
  }

  async openEndTimePicker(): Promise<void> {
    const timeOptions = this.generateTimeOptions();
    const selectedIndex = timeOptions.findIndex(option => option.value === this.endTime);

    const picker = await this.pickerController.create({
      columns: [
        {
          name: 'time',
          options: timeOptions,
          selectedIndex: selectedIndex >= 0 ? selectedIndex : 0
        }
      ],
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel'
        },
        {
          text: 'Bestätigen',
          handler: (value) => {
            this.endTime = value.time.value;
            this.onTimeChange();
          }
        }
      ]
    });

    await picker.present();
  }

  private generateTimeOptions() {
    const hours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3];
    return hours.map(hour => ({
      text: `${hour.toString().padStart(2, '0')}:00`,
      value: `${hour.toString().padStart(2, '0')}:00`
    }));
  }

  async onTimeChange(): Promise<void> {
    this.ensureTimeLogic();
    await this.onFilterChange();
  }

  private ensureTimeLogic(): void {
    let startHour = this.convertTimeToNumeric(this.startTime);
    let endHour = this.convertTimeToNumeric(this.endTime);
    const formatHour = (hour: number) => hour.toString().padStart(2, '0');

    // Ensure endHour is always at least one hour higher than startHour
    if (endHour <= startHour) {
      endHour = startHour + 1;

      if (endHour > 23) {
        endHour -= 24;
      }
      if (startHour > 23) {
        startHour -= 24;
      }
      this.endTime = `${formatHour(endHour)}:00`;
      this.startTime = `${formatHour(startHour)}:00`;
    }
  }

  private convertTimeToNumeric(timeStr: string): number {
    // Split the time string into hours and minutes
    const [hoursStr] = timeStr.split(':');
    const hours = parseInt(hoursStr, 10);

    // Convert the time to numeric representation
    return hours;
  }
}