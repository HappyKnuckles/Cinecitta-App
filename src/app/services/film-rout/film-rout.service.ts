import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilmRoutService {

  private filmTitleSource = new BehaviorSubject<string>('');
  currentFilmTitle = this.filmTitleSource.asObservable();

  changeFilmTitle(title: string): void {
    this.filmTitleSource.next(title);
  }}
