import {
  Component, DestroyRef, ElementRef, Injector, TemplateRef,
  afterNextRender, computed, effect, inject, signal, untracked, viewChild,
} from '@angular/core';
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
import { Ruta } from '../../services/ruta';
import { SoloAdmin } from '../../shared/directivas/solo-admin.directive';
import { gsap, reducirMovimiento } from '../../shared/animaciones';

const POR_PAGINA = 5;

@Component({
  selector: 'app-publicaciones',
  imports: [
    RouterLink, Avatar, Patente, LuzTestigo, ModalMensaje,
    PublicacionCard, ComentarioItem, Pedalera, SoloAdmin,
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
  private marco = viewChild.required<ElementRef<HTMLElement>>('marco');
  private carriles = viewChild.required<ElementRef<HTMLElement>>('carriles');
  private tarjetaConductor = viewChild.required<TemplateRef<unknown>>('conductor');
  private panel = inject(PanelLateral);
  private api = inject(PublicacionesApi);
  private comentariosApi = inject(ComentariosApi);
  private sesion = inject(Sesion);
  private injector = inject(Injector);
  private ruta = inject(Ruta);

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
  private viaje?: gsap.core.Tween; // el movimiento de la ruta que está en curso (pedales)
  private andar?: gsap.core.Tween; // las líneas del carril avanzando sin parar
  private indiceAnterior = 0;      // para saber si la publicación nueva viene de adelante o de atrás

  constructor() {
    // Cada vez que cambia la publicación actual, trae sus últimos 3 comentarios
    effect(() => {
      const publicacion = this.actual();
      if (!publicacion || untracked(this.comentariosRuta)[publicacion._id]) return;
      this.comentariosApi.listar(publicacion._id, 0, 3).subscribe(pagina =>
        this.comentariosRuta.update(mapa => ({ ...mapa, [publicacion._id]: pagina.comentarios })),
      );
    });

    // Cada vez que cambia la publicación (pedales, flechas o rueda): la nueva entra con rebote,
    // las líneas del carril pegan un acelerón y el cartel de KM "salta"
    effect(() => {
      const i = this.indice();
      const avanza = i >= this.indiceAnterior;
      const cambio = i !== this.indiceAnterior;
      this.indiceAnterior = i;
      if (!cambio || reducirMovimiento()) return;
      afterNextRender(() => this.animarLlegada(i, avanza), { injector: this.injector });
    });

    // Logo o botón "Ruta" estando acá: recarga desde el KM 001 (la primera vez no, porque ya carga sola)
    let primeraVez = true;
    effect(() => {
      this.ruta.reinicios();
      if (primeraVez) { primeraVez = false; return; }
      untracked(() => this.recargar());
    });

    // al dibujar la lista, arranca en el KM 001 (si no, el snap queda enganchado al cartel del final)
    this.cargar(true, () => this.irAlTramo(0));

    afterNextRender(() => {
      this.panel.contenido.set(this.tarjetaConductor());
      this.arrancarCarriles();
    });
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.soltarPedal);
      this.viaje?.kill();
      this.andar?.kill();
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
    if (!this.hayMas() || this.cargando()) return;
    const primeraNueva = this.lista().length; // donde estaba el peaje queda la primera publicación nueva
    this.cargar(false, () => this.irAlTramo(primeraNueva));
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

  // Pedales: GSAP mueve el scroll de la carretera (plugin ScrollTo).
  // Al frenar, cuando llega, la ruta "cabecea".
  private irA(i: number) {
    const destino = Math.max(0, Math.min(i, this.lista().length));
    if (destino === this.indice()) return;
    const avanza = destino > this.indice();
    const carretera = this.carretera().nativeElement;
    const top = destino * this.altoTramo();

    if (reducirMovimiento()) {
      carretera.scrollTo({ top });
      return;
    }

    // Mientras GSAP mueve el scroll apagamos el scroll-snap (si no, el navegador "tironea" la animación)
    this.viaje?.kill();
    carretera.style.scrollSnapType = 'none';
    this.viaje = gsap.to(carretera, {
      scrollTo: { y: top, autoKill: true }, // autoKill: si el usuario scrollea con la rueda, cede el control
      duration: 0.6,
      ease: 'power2.inOut', // el rebote lo hace la tarjeta al llegar (animarLlegada)
      onComplete: () => {
        carretera.style.scrollSnapType = '';
        if (!avanza) this.cabecear();
      },
      onInterrupt: () => (carretera.style.scrollSnapType = ''),
    });
  }

  // Las líneas del medio bajan sin parar: la sensación de ir manejando
  private arrancarCarriles() {
    if (reducirMovimiento()) return;
    this.andar = gsap.fromTo(
      this.carriles().nativeElement,
      { backgroundPosition: '50% 0px' },
      { backgroundPosition: '50% 84px', duration: 0.9, ease: 'none', repeat: -1 }, // 84px = raya + hueco
    );
  }

  // Llega una publicación: acelerón de las líneas (o marcha atrás), la tarjeta entra con rebote y salta el KM
  private animarLlegada(i: number, avanza: boolean) {
    const tramo = this.carretera().nativeElement.querySelectorAll<HTMLElement>('.tramo')[i];
    if (!tramo) return;

    if (this.andar) {
      gsap.timeline()
        .to(this.andar, { timeScale: avanza ? 6 : -4, duration: 0.2, ease: 'power2.out' })
        .to(this.andar, { timeScale: 1, duration: 0.9, ease: 'power2.inOut' });
    }

    const tarjeta = tramo.firstElementChild; // app-publicacion-card o el cartel del peaje
    if (tarjeta) {
      gsap.fromTo(
        tarjeta,
        { y: avanza ? 70 : -50, scale: 0.92, rotation: avanza ? 1.5 : -1.5 },
        { y: 0, scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.6)', overwrite: true },
      );
    }

    const km = tramo.querySelector('.km');
    if (km) gsap.fromTo(km, { scale: 1.5 }, { scale: 1, duration: 0.45, delay: 0.2, ease: 'back.out(3)' });

    // La licencia de la izquierda (está en el panel del layout) se da vuelta con el conductor nuevo
    const licencia = document.querySelector('.licencia');
    if (licencia) {
      gsap.fromTo(
        licencia,
        { rotationY: avanza ? -90 : 90, transformPerspective: 700 },
        { rotationY: 0, duration: 0.55, ease: 'back.out(1.6)', overwrite: true },
      );
    }
  }

  // Al frenar, la ruta baja un poquito y vuelve (como la trompa del auto)
  private cabecear() {
    gsap.fromTo(this.marco().nativeElement, { y: 0 }, { y: 8, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out' });
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
    // "tironeo" del cambio de marcha
    if (!reducirMovimiento()) {
      gsap.fromTo(this.marco().nativeElement, { x: 0 }, { x: 5, duration: 0.06, yoyo: true, repeat: 5, ease: 'none' });
    }
    this.orden.update(o => (o === 'fecha' ? 'meGusta' : 'fecha'));
    this.recargar();
  }

  // Vacía la ruta y la vuelve a pedir desde cero (trae publicaciones y comentarios nuevos)
  recargar() {
    this.lista.set([]);   // vacía la ruta mientras carga (se ve el precalentamiento)
    this.total.set(0);
    this.comentariosRuta.set({});
    this.irAlTramo(0);
    this.cargar(true, () => this.irAlTramo(0));
  }

  // Mueve la ruta a un tramo sin animación (se usa después de cargar)
  private irAlTramo(i: number) {
    const top = i * this.altoTramo();
    this.indice.set(i);
    this.ultimoScroll = top;
    this.carretera().nativeElement.scrollTo({ top });
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
      ? this.api.quitarMeGusta(publicacion._id)
      : this.api.darMeGusta(publicacion._id);

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


  confirmarBorrado() {
    const publicacion = this.aBorrar();
    const usuario = this.sesion.usuario();
    if (!publicacion || !usuario) return;

    this.api.eliminar(publicacion._id).subscribe({
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