import { Component, computed, effect, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Patente } from '../shared/patente/patente';
import { ModalMensaje } from '../shared/modal-mensaje/modal-mensaje';
import { PanelLateral } from '../shared/panel-lateral';
import { Sesion } from '../services/sesion';
import { Auth } from '../services/auth';
import { Ruta } from '../services/ruta';
import { SoloAdmin } from '../shared/directivas/solo-admin.directive';

// El token dura 60 segundos (lo firma el back) y avisamos 30 segundos antes de que venza
const MARGEN_AVISO = 30 * 1000;

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
  private router = inject(Router);

  // Controla si se ve el modal de "reserva de nafta"
  avisoSesion = signal(false);

  // Segundos que le quedan al token (se actualiza cada 1 s mientras el modal está abierto)
  segundosRestantes = signal(0);

  // Texto del modal con la cuenta regresiva
  mensajeAviso = computed(
    () =>
      `Tu sesión entra en reserva: te quedan ${this.segundosRestantes()} segundos antes de que se agote. ¿Querés cargar nafta y seguir en ruta?`,
  );

  constructor() {
    // Cada vez que cambia el token (login, refrescar, cerrar) reprogramamos los temporizadores.
    effect((onCleanup) => {
      const token = this.sesion.token(); // dependencia: el effect se vuelve a correr si cambia
      this.avisoSesion.set(false);
      if (!token) return;

      const restante = this.sesion.msHastaVencer();

      // 1) Aviso: 30 s antes de vencer. Si ya falta menos, salta enseguida.
      const idAviso = setTimeout(() => {
        this.actualizarSegundos();
        this.avisoSesion.set(true);
      }, Math.max(0, restante - MARGEN_AVISO));

      // 2) Cuenta regresiva del modal: cada segundo recalcula lo que falta
      const idCuenta = setInterval(() => this.actualizarSegundos(), 1000);

      // 3) Vencimiento: si no cargó nafta, cerramos la sesión y vamos al login
      const idFin = setTimeout(() => this.sesionVencida(), Math.max(0, restante));

      // Si el token cambia o se destruye el componente, cancelamos los temporizadores viejos.
      onCleanup(() => {
        clearTimeout(idAviso);
        clearInterval(idCuenta);
        clearTimeout(idFin);
      });
    });
  }

  // "Cargar y seguir": pide un token nuevo (otros 60 s) y lo guarda.
  // Al cambiar el token, el effect reprograma solo el aviso y el vencimiento.
  extenderSesion() {
    this.auth.refrescar().subscribe({
      next: ({ token }) => {
        this.sesion.actualizarToken(token);
        this.avisoSesion.set(false);
      },
      error: () => this.sesionVencida(), // si ya venció, al login
    });
  }

  // "Ahora no": cerramos el modal; cuando llegue a 0 la sesión se cierra sola.
  rechazarAviso() {
    this.avisoSesion.set(false);
  }

  private actualizarSegundos() {
    this.segundosRestantes.set(Math.max(0, Math.ceil(this.sesion.msHastaVencer() / 1000)));
  }

  private sesionVencida() {
    this.avisoSesion.set(false);
    this.sesion.cerrar();
    this.router.navigate(['/login']);
  }
}