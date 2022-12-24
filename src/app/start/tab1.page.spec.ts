import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExploreContainerComponentModule } from '../explore-container/explore-container.module';

import { StartPage } from './start.page';

describe('Tab1Page', () => {
  let component: StartPage;
  let fixture: ComponentFixture<StartPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StartPage],
      imports: [IonicModule.forRoot(), ExploreContainerComponentModule]
    }).compileComponents();

    fixture = TestBed.createComponent(StartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
