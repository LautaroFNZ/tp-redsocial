import { TestBed } from '@angular/core/testing';
import { EstadisticasApi } from './estadisticas-api';

describe('EstadisticasApi', () => {
  let service: EstadisticasApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadisticasApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
