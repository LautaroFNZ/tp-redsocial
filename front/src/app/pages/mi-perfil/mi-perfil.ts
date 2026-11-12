import { Component, DestroyRef, TemplateRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { UsuariosApi } from '../../services/usuarios-api';
import { Sesion } from '../../services/sesion';
import { PanelLateral } from '../../shared/panel-lateral';
import { Autor, Publicacion, Usuario } from '../../shared/modelos';
import { mensajeDeError } from '../../shared/mensaje-error';
import { Avatar } from '../../shared/avatar/avatar';
import { Patente } from '../../shared/patente/patente';
import { FotoAuto } from '../../shared/foto-auto/foto-auto';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { SinSesion } from '../../shared/sin-sesion';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';
import { ComentariosApi } from '../../services/comentarios-api';
import { Comentario } from '../../shared/modelos';

// El dueño del garage: si es el propio trae también correo y fecha de nacimiento
type Duenio = Autor & Partial<Pick<Usuario, 'correo' | 'fechaNacimiento'>>;

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, RouterLink, Avatar, Patente, FotoAuto, LuzTestigo, SinSesion, ModalMensaje],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil {
  private tarjetaFicha = viewChild.required<TemplateRef<unknown>>('ficha');
  private route = inject(ActivatedRoute);
  private panel = inject(PanelLateral);
  private publicacionesApi = inject(PublicacionesApi);
  private usuariosApi = inject(UsuariosApi);
  private sesion = inject(Sesion);
  private comentariosApi = inject(ComentariosApi);
  comentariosDe = signal<Record<string, Comentario[]>>({}); // últimos 2 de cada cochera

  duenio = signal<Duenio | null>(null);
  buscado = signal(''); // el usuario de la URL, para el mensaje de "no encontrado"
  publicaciones = signal<Publicacion[]>([]); // las últimas 3 (lo pide la consigna)
  total = signal(0);
  cargando = signal(true);
  necesitaSesion = signal(false);
  noEncontrado = signal(false);
  modal = signal<Mensaje | null>(null);
  aBorrar = signal<Publicacion | null>(null);

  esPropio = computed(() => {
    const duenio = this.duenio();
    const yo = this.sesion.usuario();
    return !!duenio && !!yo && duenio._id === yo._id;
  });

  // Borrar: el dueño del garage o un administrador
  puedeBorrar = computed(() => {
    const yo = this.sesion.usuario();
    return !!yo && (this.esPropio() || yo.perfil === 'administrador');
  });

  libres = computed(() => Array(Math.max(0, 3 - this.publicaciones().length)));

  constructor() {
    // /mi-perfil (sin parámetro) o /garage/:usuario. Si cambia el usuario de la URL, se recarga.
    this.route.paramMap
      .pipe(
        map(params => params.get('usuario')),
        switchMap(usuario => this.buscarDuenio(usuario)),
        takeUntilDestroyed(),
      )
      .subscribe(duenio => {
        this.duenio.set(duenio);
        if (duenio) this.cargarPublicaciones();
        else this.cargando.set(false);
      });

    afterNextRender(() => this.panel.contenido.set(this.tarjetaFicha()));
    inject(DestroyRef).onDestroy(() => this.panel.contenido.set(null));
  }

  private buscarDuenio(usuario: string | null): Observable<Duenio | null> {
    this.cargando.set(true);
    this.necesitaSesion.set(false);
    this.noEncontrado.set(false);
    this.publicaciones.set([]);
    this.buscado.set(usuario ?? '');

    const yo = this.sesion.usuario();

    // Mi garage (o la URL con mi propio usuario)
    if (!usuario || (yo && usuario.toLowerCase() === yo.usuario.toLowerCase())) {
      if (!yo) this.necesitaSesion.set(true);
      return of(yo);
    }

    // Garage de otro usuario
    return this.usuariosApi.buscar(usuario).pipe(
      catchError(() => {
        this.noEncontrado.set(true);
        return of(null);
      }),
    );
  }

  cargarPublicaciones() {
    const duenio = this.duenio();
    if (!duenio) return;

    this.cargando.set(true);
    this.publicacionesApi.listar({ orden: 'fecha', usuario: duenio._id, offset: 0, limit: 3 }).subscribe({
      next: pagina => {
        this.publicaciones.set(pagina.publicaciones);
        this.total.set(pagina.total);
        this.cargando.set(false);
        this.cargarComentarios(pagina.publicaciones);
      },
      error: () => this.cargando.set(false),
    });
  }

  // "Mis últimas 3 publicaciones y sus comentarios"
  private cargarComentarios(publicaciones: Publicacion[]) {
    if (!publicaciones.length) return;
    forkJoin(publicaciones.map(p => this.comentariosApi.listar(p._id, 0, 2))).subscribe(paginas => {
      const mapa: Record<string, Comentario[]> = {};
      publicaciones.forEach((p, i) => (mapa[p._id] = paginas[i].comentarios));
      this.comentariosDe.set(mapa);
    });
  }

  confirmarBorrado() {
    const publicacion = this.aBorrar();
    const yo = this.sesion.usuario();
    if (!publicacion || !yo) return;

    this.publicacionesApi.eliminar(publicacion._id, yo._id).subscribe({
      next: () => {
        this.aBorrar.set(null);
        this.modal.set({ tipo: 'ok', titulo: 'Auto fuera del garage', mensaje: `"${publicacion.titulo}" ya no aparece.` });
        this.cargarPublicaciones(); // trae de nuevo las últimas 3
      },
      error: error => {
        this.aBorrar.set(null);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos sacarlo', mensaje: mensajeDeError(error) });
      },
    });
  }
}