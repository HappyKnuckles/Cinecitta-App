import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsPage } from './newspage.page';

describe('Tab3Page', () => {
    let component: NewsPage;
    let fixture: ComponentFixture<NewsPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NewsPage]
        }).compileComponents();

        fixture = TestBed.createComponent(NewsPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
