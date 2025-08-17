import { Injectable, signal, computed } from '@angular/core';
import { ViewType } from '../../models/viewEnum';

@Injectable({
  providedIn: 'root',
})
export class UIStateService {
  // Private signals for UI state
  private _isSearchOpen = signal<boolean>(false);
  private _isModalOpen = signal<boolean>(false);
  private _detailView = signal<boolean[]>([true, false, false]);
  private _showStartTimePicker = signal<boolean>(false);
  private _showEndTimePicker = signal<boolean>(false);
  private _showFull = signal<boolean[]>([]);
  private _showAllTags = signal<boolean[]>([]);
  private _showTrailer = signal<{ [key: string]: boolean }>({});
  private _isTimesOpen = signal<{ [key: string]: boolean }>({});

  // Public computed properties
  readonly isSearchOpen = computed(() => this._isSearchOpen());
  readonly isModalOpen = computed(() => this._isModalOpen());
  readonly detailView = computed(() => this._detailView());
  readonly showStartTimePicker = computed(() => this._showStartTimePicker());
  readonly showEndTimePicker = computed(() => this._showEndTimePicker());
  readonly showFull = computed(() => this._showFull());
  readonly showAllTags = computed(() => this._showAllTags());
  readonly showTrailer = computed(() => this._showTrailer());
  readonly isTimesOpen = computed(() => this._isTimesOpen());

  constructor() {
    // Initialize view type from localStorage
    this.initializeViewType();
  }

  // Search modal state management
  setSearchOpen(isOpen: boolean): void {
    this._isSearchOpen.set(isOpen);
  }

  // General modal state management
  setModalOpen(isOpen: boolean): void {
    this._isModalOpen.set(isOpen);
  }

  // View type management
  setDetailView(viewIndex: number): void {
    const newDetailView = [false, false, false];
    newDetailView[viewIndex] = true;
    this._detailView.set(newDetailView);
    
    // Save to localStorage
    const viewTypes = [ViewType.Detail, ViewType.Kurz, ViewType.Mini];
    localStorage.setItem('viewType', viewTypes[viewIndex]);
  }

  getCurrentViewType(): ViewType {
    const detailView = this._detailView();
    if (detailView[0]) return ViewType.Detail;
    if (detailView[1]) return ViewType.Kurz;
    if (detailView[2]) return ViewType.Mini;
    return ViewType.Detail;
  }

  // Time picker state management
  setShowStartTimePicker(show: boolean): void {
    this._showStartTimePicker.set(show);
  }

  setShowEndTimePicker(show: boolean): void {
    this._showEndTimePicker.set(show);
  }

  // Content expansion state management
  setShowFull(index: number, show: boolean): void {
    const current = this._showFull();
    const updated = [...current];
    updated[index] = show;
    this._showFull.set(updated);
  }

  setShowAllTags(index: number, show: boolean): void {
    const current = this._showAllTags();
    const updated = [...current];
    updated[index] = show;
    this._showAllTags.set(updated);
  }

  // Trailer state management
  setShowTrailer(key: string, show: boolean): void {
    const current = this._showTrailer();
    const updated = { ...current };
    updated[key] = show;
    this._showTrailer.set(updated);
  }

  // Times panel state management
  setTimesOpen(key: string, isOpen: boolean): void {
    const current = this._isTimesOpen();
    const updated = { ...current };
    updated[key] = isOpen;
    this._isTimesOpen.set(updated);
  }

  // Reset all UI state to default values
  resetUIState(): void {
    this._isSearchOpen.set(false);
    this._isModalOpen.set(false);
    this._showStartTimePicker.set(false);
    this._showEndTimePicker.set(false);
    this._showFull.set([]);
    this._showAllTags.set([]);
    this._showTrailer.set({});
    this._isTimesOpen.set({});
  }

  // Private helper methods
  private initializeViewType(): void {
    const viewType = localStorage.getItem('viewType');
    if (viewType) {
      const detailView = [
        viewType === ViewType.Detail,
        viewType === ViewType.Kurz,
        viewType === ViewType.Mini
      ];
      this._detailView.set(detailView);
    }
  }
}