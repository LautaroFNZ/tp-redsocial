import {
  Component, DestroyRef, ElementRef, TemplateRef,
  afterNextRender, computed, inject, signal, viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PUBLICACIONES } from '../../shared/datos-mock';
import { PanelLateral } from '../../shared/panel-lateral';
import { Avatar } from '../../shared/avatar/avatar';
import { Patente } from '../../shared/patente/patente';
import { PublicacionCard } from '../../components/publicacion-card/publicacion-card';
import { Orden, Pedal, Pedalera } from '../../components/pedalera/pedalera';

@Component({
  selector: 'app-publicaciones',
  imports: [DatePipe, RouterLink, Avatar, Patente, PublicacionCard, Pedalera],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.scss',
  host: {
    '(document:keydown.arrowdown)': 'siguiente($event)',
    '(document:keydown.arrowup)': 'anterior($event)',
  },
})
export class Publicaciones {
  private carretera = viewChild.required<ElementRef<HTMLElement>>('carretera');
  private tarjetaConductor = viewChild.required<TemplateRef<unknown>>('conductor');
  private panel = inject(PanelLateral);

  orden = signal<Orden>('fecha');
  indice = signal(0);
  presionado = signal<Pedal>(null);

  lista = computed(() =>
    [...PUBLICACIONES].sort((a, b) =>
      this.orden() === 'fecha' ? b.fecha.localeCompare(a.fecha) : b.meGusta - a.meGusta,
    ),
  );
  actual = computed(() => this.lista()[this.indice()]);
  km = computed(() => String(this.indice() + 1).padStart(3, '0'));

  private ultimoScroll = 0;
  private soltarPedal?: ReturnType<typeof setTimeout>;

  constructor() {
    // "Al volante" se muestra en la columna izquierda del layout
    afterNextRender(() => this.panel.contenido.set(this.tarjetaConductor()));

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.soltarPedal);
      this.panel.contenido.set(null);
    });
  }

  private altoTramo(): number {
    return this.carretera().nativeElement.querySelector<HTMLElement>('.tramo')?.offsetHeight || 1;
  }

  alScrollear() {
    const top = this.carretera().nativeElement.scrollTop;

    if (top !== this.ultimoScroll) {
      this.presionado.set(top > this.ultimoScroll ? 'acelerador' : 'freno');
    }
    this.ultimoScroll = top;
    this.indice.set(Math.round(top / this.altoTramo()));

    clearTimeout(this.soltarPedal);
    this.soltarPedal = setTimeout(() => this.presionado.set(null), 180);
  }

  private irA(i: number) {
    const destino = Math.max(0, Math.min(i, this.lista().length - 1));
    this.carretera().nativeElement.scrollTo({ top: destino * this.altoTramo(), behavior: 'smooth' });
  }

  siguiente(evento?: Event) {
    evento?.preventDefault();
    this.irA(this.indice() + 1);
  }

  anterior(evento?: Event) {
    evento?.preventDefault();
    this.irA(this.indice() - 1);
  }

  cambiarOrden() {
    this.orden.update(o => (o === 'fecha' ? 'meGusta' : 'fecha'));
    this.indice.set(0);
    this.ultimoScroll = 0;
    this.carretera().nativeElement.scrollTo({ top: 0 });
  }
}