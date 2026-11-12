import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LuzTestigo } from './luz-testigo/luz-testigo';

// Se muestra en pantallas que necesitan un usuario logueado
@Component({
  selector: 'app-sin-sesion',
  imports: [RouterLink, LuzTestigo],
  template: `
    <div class="tarjeta sin-sesion">
      <app-luz-testigo tipo="cinturon" [tamano]="42" />
      <h2>Abrochate el cinturón</h2>
      <p>{{ mensaje() }}</p>
      <a class="btn verde" routerLink="/login">Iniciar sesión</a>
    </div>
  `,
  styles: `
    .sin-sesion {
      max-width: 380px;
      margin: 80px auto 0;
      padding: 26px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      text-align: center;
    }
    h2 { font-size: 20px; }
    p { margin: 0; font-size: 14px; color: #4A4D55; }
  `,
})
export class SinSesion {
  mensaje = input('Para esto necesitás iniciar sesión.');
}