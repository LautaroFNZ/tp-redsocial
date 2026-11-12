import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Usuario } from '../shared/modelos';

@Service()
export class Auth {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  // POST /auth/login → 200 con los datos del usuario
  login(datos: { usuario: string; password: string }) {
    return this.http.post<Usuario>(`${this.url}/login`, datos);
  }

  // POST /auth/registro → 201 (FormData porque lleva la foto)
  registro(datos: FormData) {
    return this.http.post<Usuario>(`${this.url}/registro`, datos);
  }
}