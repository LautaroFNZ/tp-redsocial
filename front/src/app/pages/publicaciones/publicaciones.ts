import {
  Component, DestroyRef, ElementRef, Injector, TemplateRef,
  afterNextRender, computed, effect, inject, signal, untracked, viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { ComentariosApi } from '../../services/comentarios-api';
import { Sesion } from '../../services/sesion';
import { PanelLateral } from '../../shared/panel-lateral';
import { Comentario, Orden, Publicacion } from '../../shared/modelos';
import { mensajeDeError } from '../../shared/mensaje-error';
import { Avatar } from '../../shared/avatar/avatar';
import { Patente } from '../../shared/patente/patente';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { ComentarioItem } from '../../components/comentario-item/comentario-item';
import { Pedal, Pedalera } from '../../components/pedalera/pedalera';

const POR_PAGINA = 5;

@Component({
  selector: 'app-publicaciones',
  imports: [
    DatePipe, RouterLink, Avatar, Patente, LuzTestigo, ModalMensaje,
    PublicacionCard, ComentarioItem, Pedalera,
  ],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
  host: {
    '(document:keydown.arrowdown)': 'siguiente($event)',
    '(document:keydown.arrowup)': 'anterior($event)',
  },
})
export class Publicaciones {
  private carretera = viewChild.required<ElementRef<HTMLElement>>('carretera');
  private tarjetaConductor = viewChild.required<TemplateRef<unknown>>('conductor');
  private panel = inject(PanelLateral);
  private api = inject(PublicacionesApi);
  private comentariosApi = inject(ComentariosApi);
  private sesion = inject(Sesion);
  private injector = inject(Injector);

  readonly porPagina = POR_PAGINA;

  orden = signal<Orden>('fecha');
  lista = signal<Publicacion[]>([]);   // publicaciones ya traídas
  total = signal(0);                   // total en el back
  cargando = signal(false);
  indice = signal(0);                  // 0..lista.length (el último es el cartel de peaje/fin)
  presionado = signal<Pedal>(null);
  procesandoId = signal<string | null>(null);
  modal = signal<Mensaje | null>(null);
  aBorrar = signal<Publicacion | null>(null);

  // Últimos 3 comentarios de cada publicación ya vista (para no pedirlos dos veces)
  comentariosRuta = signal<Record<string, Comentario[]>>({});

  actual = computed(() => this.lista()[this.indice()] ?? null);
  hayMas = computed(() => this.lista().length < this.total());
  restantes = computed(() => this.total() - this.lista().length);
  km = computed(() => String(this.indice() + 1).padStart(3, '0'));
  usuarioId = computed(() => this.sesion.usuario()?._id ?? null);

  private pedido = 0; // para ignorar respuestas viejas si cambia el orden
  private ultimoScroll = 0;
  private soltarPedal?: ReturnType<typeof setTimeout>;

  constructor() {
    // Cada vez que cambia la publicación actual, trae sus últimos 3 comentarios
    effect(() => {
      const publicacion = this.actual();
      if (!publicacion || untracked(this.comentariosRuta)[publicacion._id]) return;
      this.comentariosApi.listar(publicacion._id, 0, 3).subscribe(pagina =>
        this.comentariosRuta.update(mapa => ({ ...mapa, [publicacion._id]: pagina.comentarios })),
      );
    });

    this.cargar(true);

    afterNextRender(() => this.panel.contenido.set(this.tarjetaConductor()));
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.soltarPedal);
      this.panel.contenido.set(null);
    });
  }

  // ---------- datos: trae de a POR_PAGINA (paginación con offset/limit) ----------
  cargar(reiniciar = false, alTerminar?: () => void) {
    const numero = ++this.pedido;
    const offset = reiniciar ? 0 : this.lista().length;
    this.cargando.set(true);

    this.api.listar({ orden: this.orden(), offset, limit: POR_PAGINA }).subscribe({
      next: pagina => {
        if (numero !== this.pedido) return;
        this.lista.update(actuales => (reiniciar ? pagina.publicaciones : [...actuales, ...pagina.publicaciones]));
        this.total.set(pagina.total);
        this.cargando.set(false);
        // espera a que Angular dibuje la lista nueva antes de mover el scroll
        if (alTerminar) afterNextRender(alTerminar, { injector: this.injector });
      },
      error: error => {
        if (numero !== this.pedido) return;
        this.cargando.set(false);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos cargar la ruta', mensaje: mensajeDeError(error) });
      },
    });
  }

  pasarPeaje() {
    if (this.hayMas() && !this.cargando()) this.cargar();
  }

  // ---------- scroll y pedales ----------
  private altoTramo(): number {
    return this.carretera().nativeElement.querySelector<HTMLElement>('.tramo')?.offsetHeight || 1;
  }

  alScrollear() {
    const top = this.carretera().nativeElement.scrollTop;
    if (top !== this.ultimoScroll) {
      this.presionado.set(top > this.ultimoScroll ? 'acelerador' : 'freno');
    }
    this.ultimoScroll = top;
    this.indice.set(Math.min(Math.round(top / this.altoTramo()), this.lista().length));

    clearTimeout(this.soltarPedal);
    this.soltarPedal = setTimeout(() => this.presionado.set(null), 180);
  }

  private irA(i: number) {
    const destino = Math.max(0, Math.min(i, this.lista().length));
    this.carretera().nativeElement.scrollTo({ top: destino * this.altoTramo(), behavior: 'smooth' });
  }

  siguiente(evento?: Event) {
    evento?.preventDefault();
    // parado en el peaje: el acelerador lo pasa
    if (this.indice() === this.lista().length) {
      this.pasarPeaje();
      return;
    }
    this.irA(this.indice() + 1);
  }

  anterior(evento?: Event) {
    evento?.preventDefault();
    this.irA(this.indice() - 1);
  }

  // Embrague: cambia el orden y la ruta arranca de nuevo desde el KM 001
  cambiarOrden() {
    this.orden.update(o => (o === 'fecha' ? 'meGusta' : 'fecha'));
    this.lista.set([]);   // vacía la ruta mientras carga (se ve el precalentamiento)
    this.total.set(0);
    this.irAlInicio();
    this.cargar(true, () => this.irAlInicio());
  }

  private irAlInicio() {
    this.indice.set(0);
    this.ultimoScroll = 0;
    this.carretera().nativeElement.scrollTo({ top: 0 });
  }

  // ---------- me gusta (luces altas) ----------
  alternarLuces(publicacion: Publicacion) {
    const usuario = this.sesion.usuario();
    if (!usuario) {
      this.modal.set({ tipo: 'sesion', titulo: 'Abrochate el cinturón', mensaje: 'Iniciá sesión para hacerle luces a una publicación.' });
      return;
    }

    const yaLeGusta = publicacion.meGusta.includes(usuario._id);
    const pedido = yaLeGusta
      ? this.api.quitarMeGusta(publicacion._id, usuario._id)
      : this.api.darMeGusta(publicacion._id, usuario._id);

    this.procesandoId.set(publicacion._id);
    pedido.subscribe({
      next: actualizada => {
        this.lista.update(l => l.map(p => (p._id === actualizada._id ? actualizada : p)));
        this.procesandoId.set(null);
      },
      error: error => {
        this.procesandoId.set(null);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos hacer luces', mensaje: mensajeDeError(error) });
      },
    });
  }

  // ---------- borrar (autor o admin) ----------
  puedeBorrar(publicacion: Publicacion): boolean {
    const usuario = this.sesion.usuario();
    return !!usuario && (publicacion.autor._id === usuario._id || usuario.perfil === 'administrador');
  }

  confirmarBorrado() {
    const publicacion = this.aBorrar();
    const usuario = this.sesion.usuario();
    if (!publicacion || !usuario) return;

    this.api.eliminar(publicacion._id, usuario._id).subscribe({
      next: () => {
        this.aBorrar.set(null);
        this.lista.update(l => l.filter(p => p._id !== publicacion._id));
        this.total.update(t => t - 1);
        this.indice.update(i => Math.min(i, this.lista().length));
        this.modal.set({ tipo: 'ok', titulo: 'Auto fuera de la ruta', mensaje: `"${publicacion.titulo}" ya no aparece en la ruta.` });
      },
      error: error => {
        this.aBorrar.set(null);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos sacarlo', mensaje: mensajeDeError(error) });
      },
    });
  }
}