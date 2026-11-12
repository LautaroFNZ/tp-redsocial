import { Service, signal } from '@angular/core';

// Aviso entre el layout y la página de la Ruta:
// cada vez que se toca el logo o "Ruta", el contador sube y la Ruta se recarga desde el KM 001.
@Service()
export class Ruta {
  private vueltas = signal(0);
  readonly reinicios = this.vueltas.asReadonly();

  volverAlInicio() {
    this.vueltas.update(v => v + 1);
  }
}