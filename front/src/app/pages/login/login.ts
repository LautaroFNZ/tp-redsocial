import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Patente } from '../../shared/patente/patente';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';
import { REGLAS_PASSWORD, passwordSegura } from '../../shared/validators';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Patente, ModalMensaje],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, passwordSegura]],
  });

  reglas = REGLAS_PASSWORD;
  verPassword = signal(false);
  enviado = signal(false);
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
        titulo: 'Revisá los datos',
        mensaje: 'Hay campos con errores. Corregilos y volvé a intentar.',
      });
      return;
    }

    // Sprint 1: todavía no hay back. Acá va el POST a /auth/login.
    this.modal.set({
      tipo: 'ok',
      titulo: '¡Motor en marcha!',
      mensaje: `Bienvenido, ${this.form.getRawValue().usuario}.`,
    });
  }

  cerrarModal() {
    const exito = this.modal()?.tipo === 'ok';
    this.modal.set(null);
    if (exito) this.router.navigate(['/publicaciones']);
  }
}