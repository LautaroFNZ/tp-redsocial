import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pedalera } from './pedalera';

describe('Pedalera', () => {
  let component: Pedalera;
  let fixture: ComponentFixture<Pedalera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pedalera],
    }).compileComponents();

    fixture = TestBed.createComponent(Pedalera);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
