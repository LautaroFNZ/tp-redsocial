import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Patente } from './patente';

describe('Patente', () => {
  let component: Patente;
  let fixture: ComponentFixture<Patente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Patente],
    }).compileComponents();

    fixture = TestBed.createComponent(Patente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
