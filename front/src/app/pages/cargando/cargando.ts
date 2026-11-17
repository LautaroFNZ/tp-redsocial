import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Sesion } from '../../services/sesion';
import { Patente } from '../../shared/patente/patente';

@Component({
  selector: 'app-cargando',
  imports: [Patente],
  templateUrl: './cargando.html',
  styleUrl: './cargando.scss',
})
export class Cargando {
  private router = inject(Router);
  private auth = inject(Auth);
  private sesion = inject(Sesion);

  constructor() {
    // Un respiro para que se vea el tacómetro, después decide
    setTimeout(() => this.validar(), 500);
  }

  private validar() {
    // Sin token: directo al login, no hace falta preguntar al back
    if (!this.sesion.token()) {
      this.router.navigate(['/login']);
      return;
    }

    // Con token: lo validamos contra /auth/autorizar
    this.auth.autorizar().subscribe({
      next: usuario => {
        // Token válido: refrescamos los datos del usuario y entramos a la ruta
        this.sesion.iniciar(usuario, this.sesion.token()!);
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        // Token vencido o inválido: cerramos sesión y al login
        this.sesion.cerrar();
        this.router.navigate(['/login']);
      },
    });
  }
}