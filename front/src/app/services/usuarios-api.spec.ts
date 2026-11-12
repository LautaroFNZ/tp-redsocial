import { TestBed } from '@angular/core/testing';
import { UsuariosApi } from './usuarios-api';

describe('UsuariosApi', () => {
  let service: UsuariosApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuariosApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
