import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// Contenedor del Taller: las pestañas arriba y adentro la pantalla elegida (rutas hijas)
@Component({
  selector: 'app-taller',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="pestanas" aria-label="Secciones del taller">
      <a class="btn" routerLink="usuarios" routerLinkActive="activo amarillo">Usuarios</a>
      <a class="btn" routerLink="estadisticas" routerLinkActive="activo amarillo">Estadísticas</a>
    </nav>
    <router-outlet />
  `,
  styles: `
    .pestanas { display: flex; gap: 8px; margin-bottom: 16px; }
  `,
})
export class Taller {}