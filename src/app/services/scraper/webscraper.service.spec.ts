import { TestBed } from '@angular/core/testing';
import { WebscraperService } from './webscraper.service';

describe('WebscraperService', () => {
  let service: WebscraperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebscraperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
