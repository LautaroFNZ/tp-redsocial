import { Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion } from '../../shared/modelos';
import { FotoAuto } from '../../shared/foto-auto/foto-auto';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';
import { RouterLink } from '@angular/router';
import { gsap, reducirMovimiento } from '../../shared/animaciones';

@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe, FotoAuto, LuzTestigo, RouterLink],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  publicacion = input.required<Publicacion>();
  posicion = input(1);
  usuarioId = input<string | null>(null); // usuario logueado
  procesando = input(false);              // mientras se guarda el me gusta
  mostrarKm = input(true); // en la página de detalle no hace falta
  resumen = input(true);   // en la Ruta recorta el texto; en el detalle muestra solo la foto

  luces = output<void>(); // el padre llama al back

  private haces = viewChild.required<ElementRef<HTMLElement>>('haces');

  km = computed(() => String(this.posicion()).padStart(3, '0'));
  leGusta = computed(() => {
    const id = this.usuarioId();
    return !!id && this.publicacion().meGusta.includes(id);
  });

  // Botón de luces: si las está prendiendo, los faros hacen el "juego de luces" y después avisa al padre
  hacerLuces() {
    if (!this.leGusta() && !reducirMovimiento()) {
      gsap.fromTo(
        this.haces().nativeElement.children,
        { opacity: 0 },
        { opacity: 0.8, duration: 0.08, yoyo: true, repeat: 3, ease: 'none' },
      );
    }
    this.luces.emit();
  }
}
