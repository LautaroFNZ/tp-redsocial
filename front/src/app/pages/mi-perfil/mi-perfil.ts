import { Component, DestroyRef, TemplateRef, afterNextRender, computed, inject, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PUBLICACIONES, USUARIO_ACTUAL } from '../../shared/datos-mock';
import { PanelLateral } from '../../shared/panel-lateral';
import { Sesion } from '../../services/sesion';
import { Avatar } from '../../shared/avatar/avatar';
import { Patente } from '../../shared/patente/patente';
import { FotoAuto } from '../../shared/foto-auto/foto-auto';
import { LuzTestigo } from '../../shared/luz-testigo/luz-testigo';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, Avatar, Patente, FotoAuto, LuzTestigo],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil {
  private tarjetaFicha = viewChild.required<TemplateRef<unknown>>('ficha');
  private panel = inject(PanelLateral);
  private sesion = inject(Sesion);

  // Usuario logueado; si no hay sesión (sprint 1 sin guards), el de prueba
  usuario = computed(() => this.sesion.usuario() ?? USUARIO_ACTUAL);

  // Sprint 2: vendrán del back (GET /publicaciones?usuario=...)
  publicaciones = computed(() =>
    PUBLICACIONES
      .filter(p => p.autor.usuario === this.usuario().usuario)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );

  // Completa la fila de 3; si no hay autos, muestra una fila entera libre
  libres = computed(() => {
    const n = this.publicaciones().length;
    return Array(n === 0 ? 3 : (3 - (n % 3)) % 3);
  });

  constructor() {
    afterNextRender(() => this.panel.contenido.set(this.tarjetaFicha()));
    inject(DestroyRef).onDestroy(() => this.panel.contenido.set(null));
  }
}