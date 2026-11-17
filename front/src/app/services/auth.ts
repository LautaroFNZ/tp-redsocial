import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RespuestaAuth, Usuario } from '../shared/modelos';

@Service()
export class Auth {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  // POST /auth/login → 200 con { usuario, token }
  login(datos: { usuario: string; password: string }) {
    return this.http.post<RespuestaAuth>(`${this.url}/login`, datos);
  }

  // POST /auth/registro → 201 con { usuario, token } (FormData porque lleva la foto)
  registro(datos: FormData) {
    return this.http.post<RespuestaAuth>(`${this.url}/registro`, datos);
  }

  // POST /auth/autorizar → 200 con los datos del usuario si el token sirve, o 401
  autorizar() {
    return this.http.post<Usuario>(`${this.url}/autorizar`, {});
  }

  // POST /auth/refrescar → 200 con { token } nuevo (15 min más)
  refrescar() {
    return this.http.post<{ token: string }>(`${this.url}/refrescar`, {});
  }
}