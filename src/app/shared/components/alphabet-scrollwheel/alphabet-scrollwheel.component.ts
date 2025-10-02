import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';
import { Film } from 'src/app/core/models/film.model';
import { NewFilm } from 'src/app/core/models/film.model';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';
import { ImpactStyle } from '@capacitor/haptics';

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
  @Input() alwaysVisible = false; 
  @Output() letterSelected = new EventEmitter<string>();

  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  availableLetters: Set<string> = new Set();
  
  private resizeListener?: () => void;
  isDragging = false; 
  private lastSelectedLetter = '';
  private scrollThrottle: any;
  private lastVibratedLetter = ''; 
  
  currentHighlightedLetter = '';

  constructor(private hapticService: HapticService) {}

  get shouldShow(): boolean {
    return this.alwaysVisible || this.films.length > 0;
  }

  ngOnInit() {
    this.updateAvailableLetters();
    this.setupResizeListener();
    this.setupGlobalEventListeners();
  }

  ngOnDestroy() {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    // Clear any pending scroll throttle
    if (this.scrollThrottle) {
      clearTimeout(this.scrollThrottle);
    }
    this.removeGlobalEventListeners();
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

  private setupGlobalEventListeners() {
    // Global touch event listeners for consistent drag behavior
    document.addEventListener('touchmove', this.onGlobalTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onGlobalTouchEnd.bind(this), { passive: false });
    
    // Global mouse event listeners for consistent drag behavior  
    document.addEventListener('mousemove', this.onGlobalMouseMove.bind(this));
    document.addEventListener('mouseup', this.onGlobalMouseUp.bind(this));
  }

  private removeGlobalEventListeners() {
    document.removeEventListener('touchmove', this.onGlobalTouchMove.bind(this));
    document.removeEventListener('touchend', this.onGlobalTouchEnd.bind(this));
    document.removeEventListener('mousemove', this.onGlobalMouseMove.bind(this));
    document.removeEventListener('mouseup', this.onGlobalMouseUp.bind(this));
  }

  private onGlobalTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    
    // Try to find alphabet letter element first (direct touch)
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    let letter: string | undefined;
    
    if (element && element.classList.contains('alphabet-letter')) {
      letter = element.textContent?.trim();
    } else {
      // If not directly over a letter, calculate based on Y position
      letter = this.getLetterFromYPosition(touch.clientY);
    }
    
    if (letter) {
      this.currentHighlightedLetter = letter;
      if (this.availableLetters.has(letter) && letter !== this.lastSelectedLetter) {
        this.selectLetter(letter);
      }
    }
  }

  private onGlobalTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    
    event.preventDefault();
    this.isDragging = false;
    this.lastSelectedLetter = '';
    this.currentHighlightedLetter = '';
    this.lastVibratedLetter = ''; // Reset vibration tracker
  }

  private onGlobalMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    // Try to find alphabet letter element first (direct hover)
    const element = event.target as HTMLElement;
    let letter: string | undefined;
    
    if (element && element.classList.contains('alphabet-letter')) {
      letter = element.textContent?.trim();
    } else {
      // If not directly over a letter, calculate based on Y position
      letter = this.getLetterFromYPosition(event.clientY);
    }
    
    if (letter) {
      this.currentHighlightedLetter = letter;
      if (this.availableLetters.has(letter) && letter !== this.lastSelectedLetter) {
        this.selectLetter(letter);
      }
    }
  }

  private onGlobalMouseUp(event: MouseEvent) {
    if (!this.isDragging) return;
    
    event.preventDefault();
    this.isDragging = false;
    this.lastSelectedLetter = '';
    this.currentHighlightedLetter = '';
    this.lastVibratedLetter = '';
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

  onLetterMouseDown(event: MouseEvent, letter: string) {
    event.preventDefault();
    this.isDragging = true;
    this.currentHighlightedLetter = letter;
    if (this.availableLetters.has(letter)) {
      this.selectLetter(letter);
    }
  }

  private selectLetter(letter: string) {
    this.lastSelectedLetter = letter;
    this.letterSelected.emit(letter);
    
    // Add haptic feedback when selecting a new letter
    if (letter !== this.lastVibratedLetter) {
      this.hapticService.vibrate(ImpactStyle.Light, 10);
      this.lastVibratedLetter = letter;
    }
    
    // Throttle scroll operations for smoother performance
    if (this.scrollThrottle) {
      clearTimeout(this.scrollThrottle);
    }
    
    this.scrollThrottle = setTimeout(() => {
      this.scrollToLetter(letter);
    }, 30); // Reduced delay for more responsive scrolling
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
          
          // Enhanced smooth scroll with longer duration for better visual feedback
          await this.content.scrollToPoint(0, Math.max(0, targetTop - 50), 600);
        } else {
          // Fallback: estimate position based on index
          const estimatedHeight = 200; // Estimate for better accuracy
          const scrollPosition = targetFilmIndex * estimatedHeight;
          await this.content.scrollToPoint(0, scrollPosition, 600);
        }
      } catch (error) {
        // Final fallback: try direct element scrolling with enhanced smooth behavior
        const filmElements = document.querySelectorAll('[data-film-title]');
        if (filmElements[targetFilmIndex]) {
          // Use native smooth scroll with better options
          (filmElements[targetFilmIndex] as HTMLElement).scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
          
          // Additional smooth scroll using requestAnimationFrame for better control
          const targetElement = filmElements[targetFilmIndex] as HTMLElement;
          const targetPosition = targetElement.offsetTop - 50;
          const scrollElement = await this.content.getScrollElement();
          const startPosition = scrollElement.scrollTop;
          const distance = targetPosition - startPosition;
          const duration = 600;
          let startTime: number | null = null;

          const smoothScroll = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function for smoother animation (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            scrollElement.scrollTop = startPosition + (distance * easeOut);
            
            if (timeElapsed < duration) {
              requestAnimationFrame(smoothScroll);
            }
          };
          
          requestAnimationFrame(smoothScroll);
        }
      }
    }
  }

  isLetterAvailable(letter: string): boolean {
    return this.availableLetters.has(letter);
  }

  private getLetterFromYPosition(clientY: number): string | undefined {
    // Find the scrollwheel container element
    const scrollwheelElement = document.querySelector('.alphabet-scrollwheel');
    if (!scrollwheelElement) return undefined;

    const containerElement = scrollwheelElement.querySelector('.alphabet-container');
    if (!containerElement) return undefined;

    const containerRect = containerElement.getBoundingClientRect();
    
    // Check if Y position is within the container bounds
    if (clientY < containerRect.top || clientY > containerRect.bottom) {
      return undefined;
    }

    // Calculate relative position within the container (0 to 1)
    const relativeY = (clientY - containerRect.top) / containerRect.height;
    
    // Convert to letter index (0 to 25)
    const letterIndex = Math.floor(relativeY * 26);
    
    // Ensure index is within bounds
    if (letterIndex >= 0 && letterIndex < 26) {
      return this.alphabet[letterIndex];
    }
    
    return undefined;
  }
}