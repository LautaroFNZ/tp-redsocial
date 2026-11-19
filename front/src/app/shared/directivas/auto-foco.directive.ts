import { Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

// Directiva de atributo: apenas se dibuja el elemento, le pone el foco (el cursor queda listo para escribir).
// Uso: <input appAutoFoco>  o  <input [appAutoFoco]="esElPrimero">
@Directive({
  selector: '[appAutoFoco]',
})
export class AutoFoco {
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  // permite activarla con una condición; sin valor (appAutoFoco a secas) queda activa
  appAutoFoco = input(true, { transform: (valor: boolean | '') => valor !== false });

  constructor() {
    // afterNextRender: esperamos a que el elemento esté en pantalla antes de enfocarlo
    afterNextRender(() => {
      if (this.appAutoFoco()) this.elemento.nativeElement.focus();
    });
  }
}