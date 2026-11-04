import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FotoAuto } from './foto-auto';

describe('FotoAuto', () => {
  let component: FotoAuto;
  let fixture: ComponentFixture<FotoAuto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FotoAuto],
    }).compileComponents();

    fixture = TestBed.createComponent(FotoAuto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
