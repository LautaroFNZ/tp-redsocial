import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuzTestigo } from './luz-testigo';

describe('LuzTestigo', () => {
  let component: LuzTestigo;
  let fixture: ComponentFixture<LuzTestigo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LuzTestigo],
    }).compileComponents();

    fixture = TestBed.createComponent(LuzTestigo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
