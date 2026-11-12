import { Component, computed, input, output } from '@angular/core';
import { Publicacion } from '../../shared/modelos';
import { FotoAuto } from '../../shared/foto-auto/foto-auto';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-publicacion-card',
  imports: [FotoAuto, LuzTestigo, RouterLink],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  publicacion = input.required<Publicacion>();
  posicion = input(1);
  usuarioId = input<string | null>(null); // usuario logueado
  procesando = input(false);              // mientras se guarda el me gusta
  mostrarKm = input(true); // en la página de detalle no hace falta

  luces = output<void>(); // el padre llama al back

  km = computed(() => String(this.posicion()).padStart(3, '0'));
  leGusta = computed(() => {
    const id = this.usuarioId();
    return !!id && this.publicacion().meGusta.includes(id);
  });
}