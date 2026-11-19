import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TallerUsuarios } from './taller-usuarios';

describe('TallerUsuarios', () => {
  let component: TallerUsuarios;
  let fixture: ComponentFixture<TallerUsuarios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TallerUsuarios],
    }).compileComponents();

    fixture = TestBed.createComponent(TallerUsuarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
