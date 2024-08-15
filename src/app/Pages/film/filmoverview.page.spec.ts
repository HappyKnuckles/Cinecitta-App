import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmOverviewPage } from './filmoverview.page';

describe('Tab2Page', () => {
    let component: FilmOverviewPage;
    let fixture: ComponentFixture<FilmOverviewPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [FilmOverviewPage]
}).compileComponents();

        fixture = TestBed.createComponent(FilmOverviewPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
