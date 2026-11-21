import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { gsap, reducirMovimiento } from '../../shared/animaciones';

// Cantidad de elementos del fondo
const RAYAS = 14;  // rayas amarillas de cada banquina
const AUTOS = 6;   // pares de luces que pasan

// Fondo animado de toda la app: banquinas amarillas que avanzan y luces de autos que pasan.
// Va detrás de todo (z-index -1) y no recibe clics.
@Component({
  selector: 'app-fondo-ruta',
  templateUrl: './fondo-ruta.html',
  styleUrl: './fondo-ruta.scss',
})
export class FondoRuta {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  rayas = Array.from({ length: RAYAS }, (_, i) => i);
  // la mitad son faros (blancos, bajan) y la otra mitad luces de freno (rojas, suben)
  autos = Array.from({ length: AUTOS }, (_, i) => ({ id: i, frenando: i % 2 === 1 }));

  constructor() {
    afterNextRender(() => {
      if (reducirMovimiento()) return;

      // gsap.context junta todas las animaciones de este componente para poder cortarlas juntas
      const ctx = gsap.context(() => this.animar(), this.host.nativeElement);
      inject(DestroyRef).onDestroy(() => ctx.revert());
    });
  }

  private animar() {
    // 1) Banquinas: las rayas bajan sin parar (como si fueras manejando)
    gsap.to('.raya', { yPercent: 100, duration: 1.2, ease: 'none', repeat: -1 });

    // 2) Luces: cada par cruza la pantalla a una velocidad y en un carril distintos
    const alto = window.innerHeight;
    gsap.utils.toArray<HTMLElement>('.auto').forEach((auto, i) => {
      const frenando = auto.classList.contains('frenando');
      gsap.fromTo(
        auto,
        { y: frenando ? alto + 60 : -60, xPercent: 0 },
        {
          y: frenando ? -60 : alto + 60,
          duration: gsap.utils.random(5, 9),
          delay: i * 1.3,
          ease: 'none',
          repeat: -1,
          repeatDelay: gsap.utils.random(1, 4),
        },
      );
    });
  }
}
