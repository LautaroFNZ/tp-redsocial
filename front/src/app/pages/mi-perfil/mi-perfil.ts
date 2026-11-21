import {
  Component, DestroyRef, ElementRef, Injector, TemplateRef,
  afterNextRender, computed, inject, signal, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { UsuariosApi } from '../../services/usuarios-api';
import { ComentariosApi } from '../../services/comentarios-api';
import { Sesion } from '../../services/sesion';
import { PanelLateral } from '../../shared/panel-lateral';
import { Autor, Comentario, Publicacion, Usuario } from '../../shared/modelos';
import { mensajeDeError } from '../../shared/mensaje-error';
import { Avatar } from '../../shared/avatar/avatar';
import { Patente } from '../../shared/patente/patente';
import { FotoAuto } from '../../shared/foto-auto/foto-auto';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { SinSesion } from '../../shared/sin-sesion';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';
import { RecortarPipe } from '../../shared/pipes/recortar.pipe';
import { EdadPipe } from '../../shared/pipes/edad.pipe';
import { SoloAdmin } from '../../shared/directivas/solo-admin.directive';
import { EditarPerfil } from '../../components/editar-perfil/editar-perfil';
import { gsap, reducirMovimiento } from '../../shared/animaciones';

// El dueño del garage: si es el propio trae también correo y fecha de nacimiento
type Duenio = Autor & Partial<Pick<Usuario, 'correo' | 'fechaNacimiento'>>;

// Cada piso del estacionamiento es una página de 6 publicaciones.
// PB tiene las últimas 6; subiendo de piso (1, 2, 3…) aparecen las más viejas.
const POR_PISO = 6;

@Component({
  selector: 'app-mi-perfil',
  imports: [
    DatePipe, RouterLink, Avatar, Patente, FotoAuto, LuzTestigo, SinSesion, ModalMensaje,
    RecortarPipe, EdadPipe, SoloAdmin, EditarPerfil,
  ],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil {
  private tarjetaFicha = viewChild.required<TemplateRef<unknown>>('ficha');
  private route = inject(ActivatedRoute);
  private panel = inject(PanelLateral);
  private publicacionesApi = inject(PublicacionesApi);
  private usuariosApi = inject(UsuariosApi);
  private comentariosApi = inject(ComentariosApi);
  private sesion = inject(Sesion);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private injector = inject(Injector);

  duenio = signal<Duenio | null>(null);
  buscado = signal(''); // el usuario de la URL, para el mensaje de "no encontrado"
  publicaciones = signal<Publicacion[]>([]); // las 3 del piso actual
  comentariosDe = signal<Record<string, Comentario[]>>({}); // últimos 2 de cada cochera
  total = signal(0);
  pagina = signal(0); // 0 = piso de arriba (las últimas), 1 = el de abajo, ...
  cargando = signal(true);
  necesitaSesion = signal(false);
  noEncontrado = signal(false);
  modal = signal<Mensaje | null>(null);
  aBorrar = signal<Publicacion | null>(null);
  editando = signal(false); // modal "Registro automotor" (editar perfil)

  // Para el modal de edición: mis datos completos (los de la sesión)
  yo = this.sesion.usuario;

  private pedido = 0; // para ignorar respuestas viejas si se cambia de piso rápido
  private entranDesdeAbajo = false; // al bajar de piso los autos suben por la rampa

  esPropio = computed(() => {
    const duenio = this.duenio();
    const yo = this.sesion.usuario();
    return !!duenio && !!yo && duenio._id === yo._id;
  });

  // ---------- pisos ----------
  totalPisos = computed(() => Math.max(1, Math.ceil(this.total() / POR_PISO)));
  numeroPiso = computed(() => this.pagina()); // 0 = PB (las más nuevas), 1 = piso 1, ...
  desde = computed(() => this.pagina() * POR_PISO); // para numerar las cocheras
  hayMasNuevas = computed(() => this.pagina() > 0);
  hayMasViejas = computed(() => this.desde() + POR_PISO < this.total());

  // "cocheras 7-12" del piso de arriba (las más viejas)
  cocherasDeArriba = computed(() => {
    const primera = this.desde() + POR_PISO + 1;
    const ultima = Math.min(this.desde() + POR_PISO * 2, this.total());
    return primera === ultima ? `cochera ${primera}` : `cocheras ${primera}-${ultima}`;
  });

  resumen = computed(() => {
    const autos = `${this.total()} ${this.total() === 1 ? 'auto' : 'autos'}`;
    const pisos = this.totalPisos();
    return pisos === 1 ? `${autos} · PB` : `${autos} · PB a piso ${pisos - 1}`;
  });

  libres = computed(() => Array(Math.max(0, POR_PISO - this.publicaciones().length)));

  constructor() {
    // /mi-perfil (sin parámetro) o /garage/:usuario. Si cambia el usuario de la URL, se recarga desde arriba.
    this.route.paramMap
      .pipe(
        map(params => params.get('usuario')),
        switchMap(usuario => this.buscarDuenio(usuario)),
        takeUntilDestroyed(),
      )
      .subscribe(duenio => {
        this.duenio.set(duenio);
        if (duenio) this.cargarPublicaciones(0);
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
    this.total.set(0);
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

  // Trae las 3 publicaciones de un piso (paginado con offset/limit)
  cargarPublicaciones(pagina = this.pagina()) {
    const duenio = this.duenio();
    if (!duenio) return;

    const numero = ++this.pedido;
    this.pagina.set(pagina);
    this.cargando.set(true);

    this.publicacionesApi
      .listar({ orden: 'fecha', usuario: duenio._id, offset: pagina * POR_PISO, limit: POR_PISO })
      .subscribe({
        next: resultado => {
          if (numero !== this.pedido) return;

          // si el piso quedó vacío (por ejemplo, después de sacar un auto), baja al anterior
          if (!resultado.publicaciones.length && pagina > 0) {
            this.cargarPublicaciones(pagina - 1);
            return;
          }

          this.publicaciones.set(resultado.publicaciones);
          this.total.set(resultado.total);
          this.cargando.set(false);
          this.cargarComentarios(resultado.publicaciones);
          // cuando Angular dibuja las cocheras, los autos entran a estacionar
          afterNextRender(() => this.estacionar(), { injector: this.injector });
        },
        error: error => {
          if (numero !== this.pedido) return;
          this.cargando.set(false);
          this.modal.set({ tipo: 'error', titulo: 'No pudimos abrir el garage', mensaje: mensajeDeError(error) });
        },
      });
  }

  // Rampa arriba: un piso más arriba = publicaciones más viejas (los autos suben desde abajo)
  subir() {
    if (this.hayMasViejas() && !this.cargando()) {
      this.entranDesdeAbajo = true;
      this.cargarPublicaciones(this.pagina() + 1);
    }
  }

  // Rampa abajo: un piso más abajo = publicaciones más nuevas (hasta PB, las últimas)
  bajar() {
    if (this.hayMasNuevas() && !this.cargando()) {
      this.entranDesdeAbajo = false;
      this.cargarPublicaciones(this.pagina() - 1);
    }
  }

  // Animación con GSAP: los autos entran a las cocheras uno atrás del otro (stagger) y frenan con rebote
  private estacionar() {
    const autos = this.host.nativeElement.querySelectorAll('.cochera .auto');
    if (!autos.length || reducirMovimiento()) return;
    const desde = this.entranDesdeAbajo ? 180 : -180;
    gsap.fromTo(
      autos,
      { y: desde, rotation: this.entranDesdeAbajo ? -6 : 6, opacity: 0 },
      { y: 0, rotation: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'back.out(1.6)' },
    );
    this.entranDesdeAbajo = false;
  }

  // "Mis últimas 3 publicaciones y sus comentarios": 2 comentarios por cochera
  private cargarComentarios(publicaciones: Publicacion[]) {
    this.comentariosDe.set({});
    if (!publicaciones.length) return;
    forkJoin(publicaciones.map(p => this.comentariosApi.listar(p._id, 0, 2))).subscribe(paginas => {
      const mapa: Record<string, Comentario[]> = {};
      publicaciones.forEach((p, i) => (mapa[p._id] = paginas[i].comentarios));
      this.comentariosDe.set(mapa);
    });
  }

  // El modal ya guardó y actualizó la sesión: refrescamos la ficha y las cocheras (el avatar de cada auto)
  perfilGuardado(usuario: Usuario) {
    this.editando.set(false);
    this.duenio.set(usuario);
    this.cargarPublicaciones();
    this.modal.set({ tipo: 'ok', titulo: 'Datos actualizados', mensaje: 'Tu ficha ya muestra los datos nuevos.' });
  }

  confirmarBorrado() {
    const publicacion = this.aBorrar();
    const yo = this.sesion.usuario();
    if (!publicacion || !yo) return;

    this.publicacionesApi.eliminar(publicacion._id).subscribe({
      next: () => {
        this.aBorrar.set(null);
        this.modal.set({ tipo: 'ok', titulo: 'Auto fuera del garage', mensaje: `"${publicacion.titulo}" ya no aparece.` });
        this.cargarPublicaciones(); // recarga el mismo piso (si queda vacío, baja solo)
      },
      error: error => {
        this.aBorrar.set(null);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos sacarlo', mensaje: mensajeDeError(error) });
      },
    });
  }
}