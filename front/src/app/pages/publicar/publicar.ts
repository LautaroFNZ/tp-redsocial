import { Component, DestroyRef, TemplateRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicacionesApi } from '../../services/publicaciones-api';
import { Sesion } from '../../services/sesion';
import { PanelLateral } from '../../shared/panel-lateral';
import { Publicacion } from '../../shared/modelos';
import { conContenido } from '../../shared/validators';
import { mensajeDeError } from '../../shared/mensaje-error';
import { Avatar } from '../../shared/avatar/avatar';
import { Patente } from '../../shared/patente/patente';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { SinSesion } from '../../shared/sin-sesion';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';

const MAX_IMAGEN_MB = 4;

@Component({
  selector: 'app-publicar',
  imports: [ReactiveFormsModule, Avatar, Patente, LuzTestigo, SinSesion, ModalMensaje, PublicacionCard],
  templateUrl: './publicar.html',
  styleUrl: './publicar.scss',
})
export class Publicar {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private api = inject(PublicacionesApi);
  private panel = inject(PanelLateral);
  private tarjetaAutor = viewChild.required<TemplateRef<unknown>>('autor');
  sesion = inject(Sesion);

  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(80), conContenido]],
    mensaje: ['', [Validators.required, Validators.maxLength(500), conContenido]],
  });

  enviado = signal(false);
  cargando = signal(false);
  modal = signal<Mensaje | null>(null);

  imagen = signal<File | null>(null);
  imagenUrl = signal<string | null>(null);
  errorImagen = signal<string | null>(null);

  private valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  // La publicación tal como va a quedar, para la vista previa
  vistaPrevia = computed<Publicacion | null>(() => {
    const usuario = this.sesion.usuario();
    if (!usuario) return null;
    const v = this.valores();
    return {
      _id: 'vista-previa',
      titulo: v.titulo?.trim() || 'Tu título',
      mensaje: v.mensaje?.trim() || 'Tu mensaje',
      imagen: this.imagenUrl(),
      autor: usuario,
      meGusta: [],
      cantidadMeGusta: 0,
      activa: true,
      createdAt: new Date().toISOString(),
      updatedAt: '',
    };
  });

  largoTitulo = computed(() => this.valores().titulo?.length ?? 0);
  largoMensaje = computed(() => this.valores().mensaje?.length ?? 0);

  constructor() {
    afterNextRender(() => this.panel.contenido.set(this.tarjetaAutor()));
    inject(DestroyRef).onDestroy(() => {
      this.panel.contenido.set(null);
      const url = this.imagenUrl();
      if (url) URL.revokeObjectURL(url);
    });
  }

  error(campo: 'titulo' | 'mensaje'): string | null {
    const c = this.form.controls[campo];
    if (!c.invalid || !(c.dirty || c.touched || this.enviado())) return null;
    if (c.hasError('required') || c.hasError('soloEspacios')) return 'Este campo es obligatorio.';
    if (c.hasError('maxlength')) return `Máximo ${c.getError('maxlength').requiredLength} caracteres.`;
    return 'Revisá este campo.';
  }

  elegirImagen(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.errorImagen.set(null);
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.errorImagen.set('El archivo tiene que ser una imagen.');
      return;
    }
    if (archivo.size > MAX_IMAGEN_MB * 1024 * 1024) {
      this.errorImagen.set(`La imagen no puede pesar más de ${MAX_IMAGEN_MB} MB.`);
      return;
    }

    const anterior = this.imagenUrl();
    if (anterior) URL.revokeObjectURL(anterior);
    this.imagen.set(archivo);
    this.imagenUrl.set(URL.createObjectURL(archivo));
  }

  publicar() {
    this.enviado.set(true);
    const usuario = this.sesion.usuario();
    if (!usuario) return;

    if (this.form.invalid || this.errorImagen()) {
      this.form.markAllAsTouched();
      this.modal.set({ tipo: 'error', titulo: 'Faltan datos', mensaje: 'Completá el título y el mensaje.' });
      return;
    }

    const { titulo, mensaje } = this.form.getRawValue();
    const datos = new FormData();
    datos.append('titulo', titulo.trim());
    datos.append('mensaje', mensaje.trim());
    datos.append('autor', usuario._id); // sprint 3: sale del token
    const imagen = this.imagen();
    if (imagen) datos.append('imagen', imagen);

    this.cargando.set(true);
    this.api.crear(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.modal.set({ tipo: 'ok', titulo: '¡Auto en la ruta!', mensaje: 'Tu publicación ya está en la ruta.' });
      },
      error: error => {
        this.cargando.set(false);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos publicar', mensaje: mensajeDeError(error) });
      },
    });
  }

  cerrarModal() {
    const exito = this.modal()?.tipo === 'ok';
    this.modal.set(null);
    if (exito) this.router.navigate(['/publicaciones']);
  }
}