import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Patente } from '../shared/patente/patente';
import { PanelLateral } from '../shared/panel-lateral';
import { Sesion } from '../services/sesion';
import { Ruta } from '../services/ruta';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet, Patente],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  panel = inject(PanelLateral);
  sesion = inject(Sesion);
  ruta = inject(Ruta);
}