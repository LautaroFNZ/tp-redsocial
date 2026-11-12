import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Orden, PaginaPublicaciones, Publicacion } from '../shared/modelos';

@Service()
export class PublicacionesApi {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/publicaciones`;

  // GET /publicaciones?orden=&offset=&limit=&usuario=
  listar(filtros: { orden: Orden; offset: number; limit: number; usuario?: string }) {
    let params = new HttpParams()
      .set('orden', filtros.orden)
      .set('offset', filtros.offset)
      .set('limit', filtros.limit);
    if (filtros.usuario) params = params.set('usuario', filtros.usuario);
    return this.http.get<PaginaPublicaciones>(this.url, { params });
  }

  // GET /publicaciones/:id
  obtener(id: string) {
    return this.http.get<Publicacion>(`${this.url}/${id}`);
  }

  // POST /publicaciones (FormData: titulo, mensaje, autor, imagen)
  crear(datos: FormData) {
    return this.http.post<Publicacion>(this.url, datos);
  }

  // DELETE /publicaciones/:id → baja lógica
  eliminar(id: string, usuario: string) {
    return this.http.delete<void>(`${this.url}/${id}`, { body: { usuario } });
  }

  // POST / DELETE /publicaciones/:id/me-gusta
  darMeGusta(id: string, usuario: string) {
    return this.http.post<Publicacion>(`${this.url}/${id}/me-gusta`, { usuario });
  }

  quitarMeGusta(id: string, usuario: string) {
    return this.http.delete<Publicacion>(`${this.url}/${id}/me-gusta`, { body: { usuario } });
  }
}