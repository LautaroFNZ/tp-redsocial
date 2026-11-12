import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Autor } from '../shared/modelos';

@Service()
export class UsuariosApi {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  // GET /usuarios/:usuario → datos públicos del garage
  buscar(usuario: string) {
    return this.http.get<Autor>(`${this.url}/${encodeURIComponent(usuario)}`);
  }
}