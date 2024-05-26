import { TestBed } from '@angular/core/testing';

import { FilmRoutService } from './film-rout.service';

describe('FilmroutService', () => {
  let service: FilmRoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilmRoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
