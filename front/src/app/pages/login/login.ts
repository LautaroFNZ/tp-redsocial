import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Sesion } from '../../services/sesion';
import { Patente } from '../../shared/patente/patente';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';
import { mensajeDeError } from '../../shared/mensaje-error';


@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Patente, LuzTestigo, ModalMensaje],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(Auth);
  private sesion = inject(Sesion);

  // En el login solo se pide que no estén vacíos: no se dan pistas sobre la contraseña
  form = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required],
  });

  verPassword = signal(false);
  enviado = signal(false);
  cargando = signal(false);
  modal = signal<Mensaje | null>(null);

  mostrarError(campo: 'usuario' | 'password') {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || this.enviado());
  }

  ingresar() {
    this.enviado.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modal.set({
        tipo: 'error',
        titulo: 'Faltan datos',
        mensaje: 'Completá tu usuario o correo y tu contraseña.',
      });
      return;
    }


    this.cargando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: usuario => {
        this.cargando.set(false);
        this.sesion.iniciar(usuario);
        this.modal.set({ tipo: 'ok', titulo: '¡Motor en marcha!', mensaje: `Bienvenido, ${usuario.nombre}.` });
      },
      error: error => {
        this.cargando.set(false);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos arrancar', mensaje: mensajeDeError(error) });
      },
    });
  }

  cerrarModal() {
    const exito = this.modal()?.tipo === 'ok';
    this.modal.set(null);
    if (exito) this.router.navigate(['/publicaciones']);
  }
}