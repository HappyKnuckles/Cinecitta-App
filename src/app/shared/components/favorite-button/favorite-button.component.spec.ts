import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoriteButtonComponent } from './favorite-button.component';
import { FavoritesService } from 'src/app/core/services/favorites/favorites.service';
import { HapticService } from 'src/app/core/services/haptic/haptic.service';

describe('FavoriteButtonComponent', () => {
  let component: FavoriteButtonComponent;
  let fixture: ComponentFixture<FavoriteButtonComponent>;
  let favoritesServiceSpy: jasmine.SpyObj<FavoritesService>;
  let hapticServiceSpy: jasmine.SpyObj<HapticService>;

  beforeEach(async () => {
    const favSpy = jasmine.createSpyObj('FavoritesService', ['isFavorite', 'toggleFavorite']);
    const hapSpy = jasmine.createSpyObj('HapticService', ['vibrate']);

    await TestBed.configureTestingModule({
      imports: [FavoriteButtonComponent],
      providers: [
        { provide: FavoritesService, useValue: favSpy },
        { provide: HapticService, useValue: hapSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteButtonComponent);
    component = fixture.componentInstance;
    favoritesServiceSpy = TestBed.inject(FavoritesService) as jasmine.SpyObj<FavoritesService>;
    hapticServiceSpy = TestBed.inject(HapticService) as jasmine.SpyObj<HapticService>;
    
    component.filmId = 'test-film-id';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize favorite state', async () => {
    favoritesServiceSpy.isFavorite.and.returnValue(Promise.resolve(true));
    await component.ngOnInit();
    expect(component.isFavorite).toBe(true);
  });
});