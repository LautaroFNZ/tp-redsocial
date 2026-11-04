import { Component, computed, input } from '@angular/core';
import { Publicacion } from '../../shared/modelos';
import { FotoAuto } from '../../shared/foto-auto/foto-auto';

@Component({
  selector: 'app-publicacion-card',
  imports: [FotoAuto],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  publicacion = input.required<Publicacion>();
  posicion = input(1);

  km = computed(() => String(this.posicion()).padStart(3, '0'));
}