import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TallerEstadisticas } from './taller-estadisticas';

describe('TallerEstadisticas', () => {
  let component: TallerEstadisticas;
  let fixture: ComponentFixture<TallerEstadisticas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TallerEstadisticas],
    }).compileComponents();

    fixture = TestBed.createComponent(TallerEstadisticas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
