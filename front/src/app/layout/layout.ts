import { Component, effect, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Patente } from '../shared/patente/patente';
import { ModalMensaje } from '../shared/modal-mensaje/modal-mensaje';
import { PanelLateral } from '../shared/panel-lateral';
import { Sesion } from '../services/sesion';
import { Auth } from '../services/auth';
import { Ruta } from '../services/ruta';
import { SoloAdmin } from '../shared/directivas/solo-admin.directive';

// Avisamos 5 minutos antes de que venza el token
const MARGEN_AVISO = 5 * 60 * 1000;

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet, Patente, ModalMensaje, SoloAdmin],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  panel = inject(PanelLateral);
  sesion = inject(Sesion);
  ruta = inject(Ruta);
  private auth = inject(Auth);

  // Controla si se ve el modal de "reserva de nafta"
  avisoSesion = signal(false);

  constructor() {
    // Cada vez que cambia el token (login, refrescar, cerrar) reprogramamos el aviso.
    effect((onCleanup) => {
      const token = this.sesion.token(); // dependencia: el effect se vuelve a correr si cambia
      this.avisoSesion.set(false);
      if (!token) return;

      // Cuándo avisar: 5 min antes de vencer. Si ya falta menos, salta enseguida.
      const espera = Math.max(0, this.sesion.msHastaVencer() - MARGEN_AVISO);
      const id = setTimeout(() => this.avisoSesion.set(true), espera);

      // Si el token cambia o se destruye el componente, cancelamos el temporizador viejo.
      onCleanup(() => clearTimeout(id));
    });
  }

  // "Cargar y seguir": pide un token nuevo y lo guarda (al cambiar el token, el effect reprograma solo).
  extenderSesion() {
    this.auth.refrescar().subscribe({
      next: ({ token }) => {
        this.sesion.actualizarToken(token);
        this.avisoSesion.set(false);
      },
      error: () => this.avisoSesion.set(false), // si falla, la sesión vence sola
    });
  }

  // "Ahora no": no hacemos nada; cuando venza, el interceptor (401) te manda al login.
  rechazarAviso() {
    this.avisoSesion.set(false);
  }
}