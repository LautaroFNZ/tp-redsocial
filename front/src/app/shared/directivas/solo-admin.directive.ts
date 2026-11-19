import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { Sesion } from '../../services/sesion';

// Directiva estructural: muestra el contenido solo si el usuario logueado es administrador.
// Uso: <button *appSoloAdmin>Sacar</button>
// (El asterisco hace que Angular envuelva el elemento en un <ng-template>, que recibimos como TemplateRef)
@Directive({
  selector: '[appSoloAdmin]',
})
export class SoloAdmin {
  private plantilla = inject(TemplateRef);
  private contenedor = inject(ViewContainerRef);
  private sesion = inject(Sesion);
  private mostrando = false;

  constructor() {
    // effect: si cambia la sesión (login, logout), se vuelve a evaluar solo
    effect(() => {
      const esAdmin = this.sesion.usuario()?.perfil === 'administrador';
      if (esAdmin && !this.mostrando) {
        this.contenedor.createEmbeddedView(this.plantilla); // crea la vista
        this.mostrando = true;
      } else if (!esAdmin && this.mostrando) {
        this.contenedor.clear(); // la elimina
        this.mostrando = false;
      }
    });
  }
}