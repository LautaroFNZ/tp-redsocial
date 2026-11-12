import { Component, DestroyRef, TemplateRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { ComentariosApi } from '../../services/comentarios-api';
import { Sesion } from '../../services/sesion';
import { PanelLateral } from '../../shared/panel-lateral';
import { Comentario, Publicacion } from '../../shared/modelos';
import { conContenido } from '../../shared/validators';
import { mensajeDeError } from '../../shared/mensaje-error';
import { Avatar } from '../../shared/avatar/avatar';
import { Patente } from '../../shared/patente/patente';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { ComentarioItem } from '../../components/comentario-item/comentario-item';

const COMENTARIOS_POR_PAGINA = 5;

@Component({
  selector: 'app-publicacion-detalle',
  imports: [
    DatePipe, ReactiveFormsModule, RouterLink, Avatar, Patente, LuzTestigo,
    ModalMensaje, PublicacionCard, ComentarioItem,
  ],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.scss',
})
export class PublicacionDetalle {
  private route = inject(ActivatedRoute);
  private publicacionesApi = inject(PublicacionesApi);
  private comentariosApi = inject(ComentariosApi);
  private panel = inject(PanelLateral);
  private tarjetaAutor = viewChild.required<TemplateRef<unknown>>('autor');
  sesion = inject(Sesion);

  publicacion = signal<Publicacion | null>(null);
  noEncontrada = signal(false);
  procesandoLuces = signal(false);
  modal = signal<Mensaje | null>(null);

  // Comentarios: pocos al principio, "cargar más" agrega abajo sin borrar los anteriores
  comentarios = signal<Comentario[]>([]);
  totalComentarios = signal(0);
  cargandoComentarios = signal(false);
  hayMas = computed(() => this.comentarios().length < this.totalComentarios());
  restantes = computed(() => this.totalComentarios() - this.comentarios().length);

  // Nuevo comentario
  nuevo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(300), conContenido],
  });
  largoNuevo = toSignal(this.nuevo.valueChanges.pipe(map(v => v.length)), { initialValue: 0 });
  enviando = signal(false);
  errorNuevo = signal<string | null>(null);

  usuarioId = computed(() => this.sesion.usuario()?._id ?? null);

  constructor() {
    this.route.paramMap
      .pipe(map(params => params.get('id') ?? ''), takeUntilDestroyed())
      .subscribe(id => this.cargar(id));

    afterNextRender(() => this.panel.contenido.set(this.tarjetaAutor()));
    inject(DestroyRef).onDestroy(() => this.panel.contenido.set(null));
  }

  private cargar(id: string) {
    this.publicacion.set(null);
    this.noEncontrada.set(false);
    this.comentarios.set([]);
    this.totalComentarios.set(0);

    this.publicacionesApi.obtener(id).subscribe({
      next: publicacion => {
        this.publicacion.set(publicacion);
        this.cargarComentarios();
      },
      error: () => this.noEncontrada.set(true),
    });
  }

  // ---------- comentarios ----------
  cargarComentarios() {
    const publicacion = this.publicacion();
    if (!publicacion) return;

    this.cargandoComentarios.set(true);
    this.comentariosApi.listar(publicacion._id, this.comentarios().length, COMENTARIOS_POR_PAGINA).subscribe({
      next: pagina => {
        this.comentarios.update(actuales => [...actuales, ...pagina.comentarios]);
        this.totalComentarios.set(pagina.total);
        this.cargandoComentarios.set(false);
      },
      error: error => {
        this.cargandoComentarios.set(false);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos traer los comentarios', mensaje: mensajeDeError(error) });
      },
    });
  }

  comentar() {
    const publicacion = this.publicacion();
    const usuario = this.sesion.usuario();
    if (!publicacion) return;
    if (!usuario) {
      this.modal.set({ tipo: 'sesion', titulo: 'Abrochate el cinturón', mensaje: 'Iniciá sesión para comentar.' });
      return;
    }
    if (this.nuevo.invalid) {
      this.errorNuevo.set('Escribí algo antes de comentar.');
      return;
    }

    this.enviando.set(true);
    this.errorNuevo.set(null);
    this.comentariosApi.crear(publicacion._id, this.nuevo.value.trim(), usuario._id).subscribe({
      next: comentario => {
        this.enviando.set(false);
        this.nuevo.reset();
        this.comentarios.update(actuales => [comentario, ...actuales]); // el más nuevo arriba
        this.totalComentarios.update(t => t + 1);
        this.publicacion.update(p => (p ? { ...p, cantidadComentarios: (p.cantidadComentarios ?? 0) + 1 } : p));
      },
      error: error => {
        this.enviando.set(false);
        this.errorNuevo.set(mensajeDeError(error));
      },
    });
  }

  reemplazarComentario(editado: Comentario) {
    this.comentarios.update(actuales => actuales.map(c => (c._id === editado._id ? editado : c)));
  }

  // ---------- me gusta ----------
  alternarLuces(publicacion: Publicacion) {
    const usuario = this.sesion.usuario();
    if (!usuario) {
      this.modal.set({ tipo: 'sesion', titulo: 'Abrochate el cinturón', mensaje: 'Iniciá sesión para hacerle luces a una publicación.' });
      return;
    }

    const pedido = publicacion.meGusta.includes(usuario._id)
      ? this.publicacionesApi.quitarMeGusta(publicacion._id, usuario._id)
      : this.publicacionesApi.darMeGusta(publicacion._id, usuario._id);

    this.procesandoLuces.set(true);
    pedido.subscribe({
      next: actualizada => {
        this.publicacion.set(actualizada);
        this.procesandoLuces.set(false);
      },
      error: error => {
        this.procesandoLuces.set(false);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos hacer luces', mensaje: mensajeDeError(error) });
      },
    });
  }
}