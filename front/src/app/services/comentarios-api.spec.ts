import { TestBed } from '@angular/core/testing';
import { ComentariosApi } from './comentarios-api';

describe('ComentariosApi', () => {
  let service: ComentariosApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComentariosApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
