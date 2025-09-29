import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { Film } from 'src/app/core/models/filmModel';
import { NewFilm } from 'src/app/core/models/filmModel';

@Component({
  selector: 'app-alphabet-scrollwheel',
  templateUrl: './alphabet-scrollwheel.component.html',
  styleUrls: ['./alphabet-scrollwheel.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AlphabetScrollwheelComponent implements OnInit, OnDestroy, OnChanges {
  @Input() films: Film[] | NewFilm[] = [];
  @Input() content?: IonContent;
  @Input() alwaysVisible = false; // New option to keep visible even when no films
  @Output() letterSelected = new EventEmitter<string>();

  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  availableLetters: Set<string> = new Set();
  
  private resizeListener?: () => void;
  isDragging = false; // Made public for template access
  private lastSelectedLetter = '';
  
  // Track currently highlighted letter for visual feedback
  currentHighlightedLetter = '';

  get shouldShow(): boolean {
    return this.alwaysVisible || this.films.length > 0;
  }

  ngOnInit() {
    this.updateAvailableLetters();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  ngOnChanges() {
    this.updateAvailableLetters();
  }

  private setupResizeListener() {
    this.resizeListener = () => {
      // Handle orientation changes or window resizing
    };
    window.addEventListener('resize', this.resizeListener);
  }

  private updateAvailableLetters() {
    this.availableLetters.clear();
    
    this.films.forEach(film => {
      const firstLetter = film.film_titel.charAt(0).toUpperCase();
      if (firstLetter.match(/[A-Z]/)) {
        this.availableLetters.add(firstLetter);
      }
    });
  }

  onLetterClick(letter: string) {
    if (!this.availableLetters.has(letter)) {
      return;
    }

    this.selectLetter(letter);
  }

  onLetterTouchStart(event: TouchEvent, letter: string) {
    event.preventDefault();
    this.isDragging = true;
    this.currentHighlightedLetter = letter;
    if (this.availableLetters.has(letter)) {
      this.selectLetter(letter);
    }
  }

  onLetterTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.classList.contains('alphabet-letter')) {
      const letter = element.textContent?.trim();
      if (letter) {
        this.currentHighlightedLetter = letter;
        if (this.availableLetters.has(letter) && letter !== this.lastSelectedLetter) {
          this.selectLetter(letter);
        }
      }
    }
  }

  onLetterTouchEnd(event: TouchEvent) {
    event.preventDefault();
    this.isDragging = false;
    this.lastSelectedLetter = '';
    this.currentHighlightedLetter = '';
  }

  onLetterMouseDown(event: MouseEvent, letter: string) {
    event.preventDefault();
    this.isDragging = true;
    this.currentHighlightedLetter = letter;
    if (this.availableLetters.has(letter)) {
      this.selectLetter(letter);
    }
  }

  onLetterMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const element = event.target as HTMLElement;
    if (element && element.classList.contains('alphabet-letter')) {
      const letter = element.textContent?.trim();
      if (letter) {
        this.currentHighlightedLetter = letter;
        if (this.availableLetters.has(letter) && letter !== this.lastSelectedLetter) {
          this.selectLetter(letter);
        }
      }
    }
  }

  onLetterMouseUp(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = false;
    this.lastSelectedLetter = '';
    this.currentHighlightedLetter = '';
  }

  private selectLetter(letter: string) {
    this.lastSelectedLetter = letter;
    this.letterSelected.emit(letter);
    this.scrollToLetter(letter);
  }

  private async scrollToLetter(letter: string) {
    if (!this.content) {
      return;
    }

    // Find the first film that starts with this letter
    const targetFilmIndex = this.films.findIndex(film => 
      film.film_titel.charAt(0).toUpperCase() === letter
    );

    if (targetFilmIndex !== -1) {
      try {
        // Try to find the actual element by data attribute
        const targetElement = document.querySelector(`[data-film-title="${this.films[targetFilmIndex].film_titel}"]`);
        
        if (targetElement) {
          // Get the scroll element and calculate position
          const targetTop = (targetElement as HTMLElement).offsetTop;
          
          // Scroll to the element with some padding
          await this.content.scrollToPoint(0, Math.max(0, targetTop - 20), 500);
        } else {
          // Fallback: estimate position based on index
          const estimatedHeight = 200; // Increased estimate for better accuracy
          const scrollPosition = targetFilmIndex * estimatedHeight;
          await this.content.scrollToPoint(0, scrollPosition, 500);
        }
      } catch (error) {
        // Final fallback: try direct element scrolling
        const filmElements = document.querySelectorAll('[data-film-title]');
        if (filmElements[targetFilmIndex]) {
          filmElements[targetFilmIndex].scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }
    }
  }

  isLetterAvailable(letter: string): boolean {
    return this.availableLetters.has(letter);
  }
}