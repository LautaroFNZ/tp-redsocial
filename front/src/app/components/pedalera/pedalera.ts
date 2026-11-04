import { Component, computed, input, output } from '@angular/core';

export type Orden = 'fecha' | 'meGusta';
export type Pedal = 'freno' | 'acelerador' | null;

@Component({
  selector: 'app-pedalera',
  templateUrl: './pedalera.html',
  styleUrl: './pedalera.scss',
})
export class Pedalera {
  orden = input<Orden>('fecha');
  hayAnterior = input(true);
  haySiguiente = input(true);
  presionado = input<Pedal>(null); // lo hunde el scroll

  embrague = output<void>();
  freno = output<void>();
  acelerador = output<void>();

  marcha = computed(() => (this.orden() === 'fecha' ? '1ra · nuevas' : '2da · más luces'));
}