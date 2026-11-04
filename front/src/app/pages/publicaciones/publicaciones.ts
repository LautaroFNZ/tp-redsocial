import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PUBLICACIONES } from '../../shared/datos-mock';
import { Avatar } from '../../shared/avatar/avatar';
import { Patente } from '../../shared/patente/patente';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { Orden, Pedalera } from '../../components/pedalera/pedalera';

@Component({
  selector: 'app-publicaciones',
  imports: [RouterLink, Avatar, Patente, PublicacionCard, Pedalera],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
  host: {
    '(document:keydown.arrowdown)': 'siguiente()',
    '(document:keydown.arrowup)': 'anterior()',
  },
})
export class Publicaciones {
  orden = signal<Orden>('fecha');
  indice = signal(0);

  lista = computed(() =>
    [...PUBLICACIONES].sort((a, b) =>
      this.orden() === 'fecha' ? b.fecha.localeCompare(a.fecha) : b.meGusta - a.meGusta,
    ),
  );
  actual = computed(() => this.lista()[this.indice()]);

  siguiente() {
    this.indice.update(i => Math.min(i + 1, this.lista().length - 1));
  }

  anterior() {
    this.indice.update(i => Math.max(i - 1, 0));
  }

  cambiarOrden() {
    this.orden.update(o => (o === 'fecha' ? 'meGusta' : 'fecha'));
    this.indice.set(0);
  }
}