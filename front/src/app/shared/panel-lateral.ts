import { Service, TemplateRef, signal } from '@angular/core';

// Permite que cada página ponga su propia tarjeta abajo del menú lateral
@Service()
export class PanelLateral {
  contenido = signal<TemplateRef<unknown> | null>(null);
}