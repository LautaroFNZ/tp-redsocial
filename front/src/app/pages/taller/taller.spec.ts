import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Taller } from './taller';

describe('Taller', () => {
  let component: Taller;
  let fixture: ComponentFixture<Taller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Taller],
    }).compileComponents();

    fixture = TestBed.createComponent(Taller);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
