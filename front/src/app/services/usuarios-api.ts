import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Autor, Usuario } from '../shared/modelos';

@Service()
export class UsuariosApi {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  // GET /usuarios/:usuario → datos públicos del garage
  buscar(usuario: string) {
    return this.http.get<Autor>(`${this.url}/${encodeURIComponent(usuario)}`);
  }

  // ---------- Taller (solo admin; el token lo agrega el interceptor) ----------

  // GET /usuarios → todos los usuarios
  listar() {
    return this.http.get<Usuario[]>(this.url);
  }

  // POST /usuarios → alta con perfil elegido (FormData porque puede llevar foto)
  crear(datos: FormData) {
    return this.http.post<Usuario>(this.url, datos);
  }

  // DELETE /usuarios/:id → baja lógica
  deshabilitar(id: string) {
    return this.http.delete<Usuario>(`${this.url}/${id}`);
  }

  // POST /usuarios/:id/habilitar → alta lógica
  habilitar(id: string) {
    return this.http.post<Usuario>(`${this.url}/${id}/habilitar`, {});
  }
}