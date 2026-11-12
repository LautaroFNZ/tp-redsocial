import { TestBed } from '@angular/core/testing';
import { PublicacionesApi } from './publicaciones-api';

describe('PublicacionesApi', () => {
  let service: PublicacionesApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicacionesApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
