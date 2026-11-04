import { Component, computed, input, signal } from '@angular/core';
import { Publicacion } from '../../shared/modelos';
import { FotoAuto } from '../../shared/foto-auto/foto-auto';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';

@Component({
  selector: 'app-publicacion-card',
  imports: [FotoAuto, LuzTestigo],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  publicacion = input.required<Publicacion>();
  posicion = input(1);

  km = computed(() => String(this.posicion()).padStart(3, '0'));

  // Sprint 1: solo visual. Sprint 2: POST / DELETE del me gusta.
  leGusta = signal(false);
  luces = computed(() => this.publicacion().meGusta + (this.leGusta() ? 1 : 0));

  alternarLuces() {
    this.leGusta.update(v => !v);
  }
}