import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComentarioItem } from './comentario-item';

describe('ComentarioItem', () => {
  let component: ComentarioItem;
  let fixture: ComponentFixture<ComentarioItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComentarioItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ComentarioItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
