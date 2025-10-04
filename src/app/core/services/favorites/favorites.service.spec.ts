import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';
import { StorageService } from '../storage/storage.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('StorageService', ['get', 'save']);

    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useValue: spy }
      ]
    });
    service = TestBed.inject(FavoritesService);
    storageServiceSpy = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get empty favorites initially', async () => {
    storageServiceSpy.get.and.returnValue(Promise.resolve(null));
    const favorites = await service.getFavorites();
    expect(favorites).toEqual([]);
  });

  it('should add film to favorites', async () => {
    storageServiceSpy.get.and.returnValue(Promise.resolve([]));
    storageServiceSpy.save.and.returnValue(Promise.resolve());

    await service.addToFavorites('film123');

    expect(storageServiceSpy.save).toHaveBeenCalledWith('favoriteFilms', ['film123']);
  });

  it('should check if film is favorite', async () => {
    storageServiceSpy.get.and.returnValue(Promise.resolve(['film123']));
    const isFavorite = await service.isFavorite('film123');
    expect(isFavorite).toBe(true);
  });
});