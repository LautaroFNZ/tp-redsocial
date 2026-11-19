import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosApi } from '../../services/usuarios-api';
import { Sesion } from '../../services/sesion';
import { Usuario } from '../../shared/modelos';
import {
  EDAD_MINIMA, PATRON_CORREO, PATRON_NOMBRE, REGLAS_PASSWORD,
  coincidenPasswords, edadPermitida, passwordSegura,
} from '../../shared/validators';
import { mensajeDeError } from '../../shared/mensaje-error';
import { Patente } from '../../shared/patente/patente';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';

type Filtro = 'todos' | 'habilitados' | 'deshabilitados';
const MAX_FOTO_MB = 2;

@Component({
  selector: 'app-taller-usuarios',
  imports: [ReactiveFormsModule, Patente, LuzTestigo, ModalMensaje],
  templateUrl: './taller-usuarios.html',
  styleUrl: './taller-usuarios.scss',
})
export class TallerUsuarios {
  private fb = inject(FormBuilder);
  private api = inject(UsuariosApi);
  private sesion = inject(Sesion);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  filtro = signal<Filtro>('todos');
  procesandoId = signal<string | null>(null);
  modal = signal<Mensaje | null>(null);
  aDeshabilitar = signal<Usuario | null>(null);

  miId = computed(() => this.sesion.usuario()?._id ?? null);

  // La lista se filtra en el front: ya tenemos todos los usuarios, no hace falta otro pedido
  visibles = computed(() => {
    const lista = this.usuarios();
    switch (this.filtro()) {
      case 'habilitados': return lista.filter(u => u.activo !== false);
      case 'deshabilitados': return lista.filter(u => u.activo === false);
      default: return lista;
    }
  });

  readonly filtros: { valor: Filtro; texto: string }[] = [
    { valor: 'todos', texto: 'Todos' },
    { valor: 'habilitados', texto: 'En ruta' },
    { valor: 'deshabilitados', texto: 'Inhibidos' },
  ];

  // ---------- alta (mismos datos que el registro + perfil con radio buttons) ----------
  formAbierto = signal(false);
  enviado = signal(false);
  guardando = signal(false);
  foto = signal<File | null>(null);
  errorFoto = signal<string | null>(null);
  readonly hoy = new Date().toISOString().slice(0, 10);
  reglas = REGLAS_PASSWORD;

  form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50),
                    Validators.pattern(PATRON_NOMBRE)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50),
                      Validators.pattern(PATRON_NOMBRE)]],
      correo: ['', [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
      usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15),
                     Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, passwordSegura]],
      repetirPassword: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, edadPermitida]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      perfil: ['usuario' as 'usuario' | 'administrador', Validators.required],
    },
    { validators: coincidenPasswords },
  );

  campos = [
    { control: 'nombre', etiqueta: 'Nombre', tipo: 'text' },
    { control: 'apellido', etiqueta: 'Apellido', tipo: 'text' },
    { control: 'correo', etiqueta: 'Correo', tipo: 'email' },
    { control: 'usuario', etiqueta: 'Nombre de usuario', tipo: 'text' },
  ] as const;

  constructor() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.api.listar().subscribe({
      next: lista => {
        this.usuarios.set(lista);
        this.cargando.set(false);
      },
      error: error => {
        this.cargando.set(false);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos abrir el taller', mensaje: mensajeDeError(error) });
      },
    });
  }

  // ---------- baja y alta lógica ----------
  confirmarDeshabilitar() {
    const usuario = this.aDeshabilitar();
    if (!usuario) return;
    this.aDeshabilitar.set(null);
    this.procesandoId.set(usuario._id);
    this.api.deshabilitar(usuario._id).subscribe({
      next: actualizado => this.reemplazar(actualizado),
      error: error => this.falloEstado(error),
    });
  }

  habilitar(usuario: Usuario) {
    this.procesandoId.set(usuario._id);
    this.api.habilitar(usuario._id).subscribe({
      next: actualizado => this.reemplazar(actualizado),
      error: error => this.falloEstado(error),
    });
  }

  // Cambia solo la fila tocada, sin volver a pedir toda la lista
  private reemplazar(actualizado: Usuario) {
    this.usuarios.update(lista => lista.map(u => (u._id === actualizado._id ? actualizado : u)));
    this.procesandoId.set(null);
  }

  private falloEstado(error: unknown) {
    this.procesandoId.set(null);
    this.modal.set({ tipo: 'error', titulo: 'No pudimos cambiar el estado', mensaje: mensajeDeError(error) });
  }

  // ---------- formulario de alta ----------
  abrirAlta() {
    this.form.reset();
    this.enviado.set(false);
    this.foto.set(null);
    this.errorFoto.set(null);
    this.formAbierto.set(true);
  }

  private visible(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.dirty || c.touched || this.enviado();
  }

  error(campo: keyof typeof this.form.controls): string | null {
    const c = this.form.controls[campo];
    if (!c.invalid || !this.visible(campo)) return null;

    if (c.hasError('required')) return 'Este campo es obligatorio.';
    if (c.hasError('minlength')) return `Mínimo ${c.getError('minlength').requiredLength} caracteres.`;
    if (c.hasError('maxlength')) return `Máximo ${c.getError('maxlength').requiredLength} caracteres.`;
    if (c.hasError('email') || (campo === 'correo' && c.hasError('pattern'))) {
      return 'Ingresá un correo válido, por ejemplo nombre@mail.com.';
    }
    if (c.hasError('pattern')) {
      return campo === 'usuario'
        ? 'Solo letras, números y guion bajo, sin espacios.'
        : 'Solo letras, espacios, apóstrofe o guion.';
    }
    if (c.hasError('fechaInvalida')) return 'La fecha no es válida.';
    if (c.hasError('fechaFutura')) return 'La fecha no puede ser futura.';
    if (c.hasError('menorDeEdad')) return `Tiene que tener al menos ${EDAD_MINIMA} años.`;
    if (c.hasError('edadMaxima')) return 'Revisá el año de nacimiento.';
    return 'Revisá este campo.';
  }

  errorRepetir(): string | null {
    const c = this.form.controls.repetirPassword;
    if (!this.visible('repetirPassword')) return null;
    if (c.hasError('required')) return 'Repetí la contraseña.';
    if (this.form.hasError('noCoinciden')) return 'Las contraseñas no coinciden.';
    return null;
  }

  elegirFoto(evento: Event) {
    const archivo = (evento.target as HTMLInputElement).files?.[0] ?? null;
    this.errorFoto.set(null);
    this.foto.set(null);
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      this.errorFoto.set('El archivo tiene que ser una imagen.');
      return;
    }
    if (archivo.size > MAX_FOTO_MB * 1024 * 1024) {
      this.errorFoto.set(`La imagen no puede pesar más de ${MAX_FOTO_MB} MB.`);
      return;
    }
    this.foto.set(archivo);
  }

  darDeAlta() {
    this.enviado.set(true);
    if (this.form.invalid || this.errorFoto()) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = new FormData();
    for (const [campo, valor] of Object.entries(this.form.getRawValue())) {
      if (campo !== 'repetirPassword') datos.append(campo, valor);
    }
    const foto = this.foto();
    if (foto) datos.append('foto', foto);

    this.guardando.set(true);
    this.api.crear(datos).subscribe({
      next: creado => {
        this.guardando.set(false);
        this.formAbierto.set(false);
        this.usuarios.update(lista => [creado, ...lista]); // el más nuevo arriba, como lo ordena el back
        this.modal.set({
          tipo: 'ok',
          titulo: 'Patente entregada',
          mensaje: `${creado.usuario} ya puede salir a la ruta como ${creado.perfil}.`,
        });
      },
      error: error => {
        this.guardando.set(false);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos darlo de alta', mensaje: mensajeDeError(error) });
      },
    });
  }
}