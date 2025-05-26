import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FilmSelectComponent } from './film-select.component';

describe('FilmSelectComponent', () => {
  let component: FilmSelectComponent;
  let fixture: ComponentFixture<FilmSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FilmSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilmSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
