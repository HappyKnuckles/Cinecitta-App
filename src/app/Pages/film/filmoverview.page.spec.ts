import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../../explore-container/explore-container.module';

import { FilmOverviewPage } from './filmoverview.page';

describe('Tab2Page', () => {
  let component: FilmOverviewPage;
  let fixture: ComponentFixture<FilmOverviewPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilmOverviewPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FilmOverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
