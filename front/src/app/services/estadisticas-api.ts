import { Service, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  ComentariosPorDia, ComentariosPorPublicacion, PublicacionesPorUsuario, RangoFechas,
} from '../shared/modelos';

// Rutas del EstadisticasController del back (solo admin; el token lo agrega el interceptor)
@Service()
export class EstadisticasApi {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/estadisticas`;

  publicacionesPorUsuario(rango: RangoFechas) {
    return this.http.get<PublicacionesPorUsuario[]>(`${this.url}/publicaciones-por-usuario`, { params: this.params(rango) });
  }

  comentariosPorDia(rango: RangoFechas) {
    return this.http.get<ComentariosPorDia[]>(`${this.url}/comentarios-por-dia`, { params: this.params(rango) });
  }

  comentariosPorPublicacion(rango: RangoFechas) {
    return this.http.get<ComentariosPorPublicacion[]>(`${this.url}/comentarios-por-publicacion`, { params: this.params(rango) });
  }

  // ?desde=AAAA-MM-DD&hasta=AAAA-MM-DD
  private params({ desde, hasta }: RangoFechas) {
    return new HttpParams().set('desde', desde).set('hasta', hasta);
  }
}