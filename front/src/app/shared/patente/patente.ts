import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-patente',
  templateUrl: './patente.html',
  styleUrl: './patente.scss',
})
export class Patente {
  texto = input.required<string>();
  leyenda = input('GARAGEHUB · AR');
  tamano = input<'chica' | 'grande'>('chica');

  // achica la letra para que entren usuarios largos (hasta 15 caracteres)
  largo = computed(() => {
    const n = this.texto().length;
    return n > 13 ? 'muy-largo' : n > 10 ? 'largo' : '';
  });
}