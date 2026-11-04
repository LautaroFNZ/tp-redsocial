import { Component, DestroyRef, TemplateRef, afterNextRender, inject, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PUBLICACIONES, USUARIO_ACTUAL } from '../../shared/datos-mock';
import { PanelLateral } from '../../shared/panel-lateral';
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

  usuario = USUARIO_ACTUAL;

  publicaciones = PUBLICACIONES
    .filter(p => p.autor.usuario === this.usuario.usuario)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Completa la última fila de 3 con cocheras libres
  libres = Array((3 - (this.publicaciones.length % 3)) % 3);

  constructor() {
    afterNextRender(() => this.panel.contenido.set(this.tarjetaFicha()));
    inject(DestroyRef).onDestroy(() => this.panel.contenido.set(null));
  }
}