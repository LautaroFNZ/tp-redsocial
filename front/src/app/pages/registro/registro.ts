import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Patente } from '../../shared/patente/patente';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';
import { REGLAS_PASSWORD, coincidenPasswords, fechaPasada, passwordSegura } from '../../shared/validators';

const MAX_FOTO_MB = 2;

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Patente, ModalMensaje],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.maxLength(50)]],
      correo: ['', [Validators.required, Validators.email]],
      usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15),
                     Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, passwordSegura]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, fechaPasada]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
    },
    { validators: coincidenPasswords },
  );

  // Los campos de texto simples se dibujan con un @for
  campos = [
    { control: 'nombre', etiqueta: 'Nombre', tipo: 'text', auto: 'given-name' },
    { control: 'apellido', etiqueta: 'Apellido', tipo: 'text', auto: 'family-name' },
    { control: 'correo', etiqueta: 'Correo', tipo: 'email', auto: 'email' },
    { control: 'usuario', etiqueta: 'Nombre de usuario', tipo: 'text', auto: 'username' },
  ] as const;

  readonly perfil = 'usuario'; // por defecto; el admin lo puede cambiar más adelante
  readonly hoy = new Date().toISOString().slice(0, 10);
  reglas = REGLAS_PASSWORD;

  enviado = signal(false);
  modal = signal<Mensaje | null>(null);

  // Foto de perfil
  foto = signal<File | null>(null);
  fotoUrl = signal<string | null>(null);
  errorFoto = signal<string | null>(null);

  // Vista previa en vivo: "así te van a ver"
  private valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  iniciales = computed(() => {
    const v = this.valores();
    return ((v.nombre?.[0] ?? '') + (v.apellido?.[0] ?? '')).toUpperCase() || '?';
  });
  patente = computed(() => this.valores().usuario?.trim() || 'TU_USUARIO');
  largoDescripcion = computed(() => this.valores().descripcion?.length ?? 0);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      const url = this.fotoUrl();
      if (url) URL.revokeObjectURL(url);
    });
  }

  error(campo: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[campo];
    if (!c.invalid || !(c.touched || this.enviado())) return null;
    if (c.hasError('required')) return 'Este campo es obligatorio.';
    if (c.hasError('email')) return 'Ingresá un correo válido.';
    if (c.hasError('minlength')) return `Mínimo ${c.getError('minlength').requiredLength} caracteres.`;
    if (c.hasError('maxlength')) return `Máximo ${c.getError('maxlength').requiredLength} caracteres.`;
    if (c.hasError('pattern')) return 'Solo letras, números y guion bajo.';
    if (c.hasError('fechaFutura')) return 'La fecha no puede ser futura.';
    return 'Revisá este campo.';
  }

  errorRepetir(): string | null {
    const c = this.form.controls.repetirPassword;
    if (!(c.touched || this.enviado())) return null;
    if (c.hasError('required')) return 'Repetí la contraseña.';
    if (this.form.hasError('noCoinciden')) return 'Las contraseñas no coinciden.';
    return null;
  }

  elegirFoto(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.errorFoto.set(null);
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.errorFoto.set('El archivo tiene que ser una imagen.');
      return;
    }
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
      this.errorFoto.set(`La imagen no puede pesar más de ${MAX_FOTO_MB} MB.`);
      return;
    }

    const anterior = this.fotoUrl();
    if (anterior) URL.revokeObjectURL(anterior);
    this.foto.set(archivo);
    this.fotoUrl.set(URL.createObjectURL(archivo));
  }

  registrar() {
    this.enviado.set(true);

    if (this.form.invalid || this.errorFoto()) {
      this.form.markAllAsTouched();
      this.modal.set({
        tipo: 'error',
        titulo: 'Faltan datos',
        mensaje: 'Hay campos con errores. Revisalos y volvé a intentar.',
      });
      return;
    }

    // Sprint 1: todavía no hay back. Acá va el POST a /auth/registro
    // con FormData (los datos del form + this.perfil + this.foto()).
    this.modal.set({
      tipo: 'ok',
      titulo: '¡Patente lista!',
      mensaje: `Tu garage ${this.form.getRawValue().usuario} quedó armado. Ahora ingresá con tus datos.`,
    });
  }

  cerrarModal() {
    const exito = this.modal()?.tipo === 'ok';
    this.modal.set(null);
    if (exito) this.router.navigate(['/login']);
  }
}