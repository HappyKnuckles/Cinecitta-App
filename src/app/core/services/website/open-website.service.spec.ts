import { TestBed } from '@angular/core/testing';
import { OpenWebsiteService } from './open-website.service';

describe('OpenWebsiteService', () => {
  let service: OpenWebsiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenWebsiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
