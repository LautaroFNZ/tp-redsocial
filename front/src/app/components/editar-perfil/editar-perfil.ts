import { Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosApi } from '../../services/usuarios-api';
import { Sesion } from '../../services/sesion';
import { Usuario } from '../../shared/modelos';
import { PATRON_NOMBRE, conContenido } from '../../shared/validators';
import { mensajeDeError } from '../../shared/mensaje-error';
import { Avatar } from '../../shared/avatar/avatar';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { AutoFoco } from '../../shared/directivas/auto-foco.directive';

const MAX_FOTO_MB = 2;

// Modal "Registro automotor": el usuario actualiza nombre, apellido, descripción y foto de su ficha
@Component({
  selector: 'app-editar-perfil',
  imports: [ReactiveFormsModule, Avatar, LuzTestigo, AutoFoco],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.scss',
  host: { '(document:keydown.escape)': 'cancelar()' },
})
export class EditarPerfil implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosApi = inject(UsuariosApi);
  private sesion = inject(Sesion);

  usuario = input.required<Usuario>();
  cerrar = output<void>();
  guardado = output<Usuario>();

  // Formulario reactivo con las mismas reglas que el registro (y que el DTO del back)
  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50),
                  Validators.pattern(PATRON_NOMBRE)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50),
                    Validators.pattern(PATRON_NOMBRE)]],
    descripcion: ['', [Validators.required, conContenido, Validators.minLength(10), Validators.maxLength(200)]],
  });

  enviado = signal(false);
  guardando = signal(false);
  errorServidor = signal<string | null>(null);

  // Foto nueva (si eligió una) y su vista previa local
  foto = signal<File | null>(null);
  fotoUrl = signal<string | null>(null);
  errorFoto = signal<string | null>(null);

  // Vista previa en vivo del avatar con lo que va escribiendo
  private valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  vistaPrevia = computed(() => {
    const v = this.valores();
    return {
      nombre: v.nombre?.trim() || '?',
      apellido: v.apellido?.trim() || '?',
      usuario: this.usuario().usuario,
      foto: this.fotoUrl() ?? this.usuario().foto ?? null,
    };
  });
  largoDescripcion = computed(() => this.valores().descripcion?.length ?? 0);

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      const url = this.fotoUrl();
      if (url) URL.revokeObjectURL(url);
    });
  }

  ngOnInit() {
    // Arranca con los datos actuales de la ficha
    const { nombre, apellido, descripcion } = this.usuario();
    this.form.setValue({ nombre, apellido, descripcion });
  }

  error(campo: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[campo];
    if (!c.invalid || !(c.dirty || c.touched || this.enviado())) return null;

    if (c.hasError('required') || c.hasError('soloEspacios')) return 'Este campo es obligatorio.';
    if (c.hasError('minlength')) return `Mínimo ${c.getError('minlength').requiredLength} caracteres.`;
    if (c.hasError('maxlength')) return `Máximo ${c.getError('maxlength').requiredLength} caracteres.`;
    if (c.hasError('pattern')) return 'Solo letras, espacios, apóstrofe o guion.';
    return 'Revisá este campo.';
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

  guardar() {
    this.enviado.set(true);
    this.errorServidor.set(null);
    if (this.form.invalid || this.errorFoto()) {
      this.form.markAllAsTouched();
      return;
    }

    // FormData porque puede viajar la foto; el back la sube a Cloudinary
    const datos = new FormData();
    for (const [campo, valor] of Object.entries(this.form.getRawValue())) {
      datos.append(campo, valor.trim());
    }
    const foto = this.foto();
    if (foto) datos.append('foto', foto);

    this.guardando.set(true);
    this.usuariosApi.editarPerfil(datos).subscribe({
      next: usuario => {
        this.guardando.set(false);
        this.sesion.actualizarUsuario(usuario); // así el menú, la ruta y el garage ven los datos nuevos
        this.guardado.emit(usuario);
      },
      error: error => {
        this.guardando.set(false);
        this.errorServidor.set(mensajeDeError(error));
      },
    });
  }

  cancelar() {
    if (!this.guardando()) this.cerrar.emit();
  }
}