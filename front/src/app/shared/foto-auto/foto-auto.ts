import { Component, input } from '@angular/core';
import { ImagenRespaldo } from '../directivas/imagen-respaldo.directive';

@Component({
  selector: 'app-foto-auto',
  templateUrl: './foto-auto.html',
  styleUrl: './foto-auto.scss',
})
export class FotoAuto {
  imagen = input<string | null | undefined>(null);
  alt = input('');
}