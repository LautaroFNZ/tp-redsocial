import { Component, input, output } from '@angular/core';
import { LuzTestigo } from '../luz-testigo/luz-testigo';

export interface Mensaje {
  titulo: string;
  mensaje: string;
  tipo: 'ok' | 'error';
}

@Component({
  selector: 'app-modal-mensaje',
  imports: [LuzTestigo],
  templateUrl: './modal-mensaje.html',
  styleUrl: './modal-mensaje.scss',
  host: { '(document:keydown.escape)': 'cerrar.emit()' },
})
export class ModalMensaje {
  titulo = input.required<string>();
  mensaje = input.required<string>();
  tipo = input<'ok' | 'error'>('ok');
  cerrar = output<void>();
}