import { Component, input } from '@angular/core';

@Component({
  selector: 'app-patente',
  templateUrl: './patente.html',
  styleUrl: './patente.scss',
})
export class Patente {
  texto = input.required<string>();
  leyenda = input('GARAGEHUB · AR');
  tamano = input<'chica' | 'grande'>('chica');
}