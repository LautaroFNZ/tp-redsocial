import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalMensaje } from './modal-mensaje';

describe('ModalMensaje', () => {
  let component: ModalMensaje;
  let fixture: ComponentFixture<ModalMensaje>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalMensaje],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalMensaje);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
