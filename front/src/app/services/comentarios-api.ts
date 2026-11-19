import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Comentario, PaginaComentarios } from '../shared/modelos';

@Service()
export class ComentariosApi {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  // GET /publicaciones/:id/comentarios?offset&limit → los más recientes primero
  listar(publicacionId: string, offset: number, limit: number) {
    const params = new HttpParams().set('offset', offset).set('limit', limit);
    return this.http.get<PaginaComentarios>(`${this.url}/publicaciones/${publicacionId}/comentarios`, { params });
  }

  // POST /publicaciones/:id/comentarios — el autor sale del token
  crear(publicacionId: string, mensaje: string) {
    return this.http.post<Comentario>(`${this.url}/publicaciones/${publicacionId}/comentarios`, { mensaje });
  }

  // PUT /comentarios/:id → marca modificado: true. El usuario sale del token.
  editar(id: string, mensaje: string) {
    return this.http.put<Comentario>(`${this.url}/comentarios/${id}`, { mensaje });
  }
}