import { Component, input, output } from '@angular/core';

export interface Mensaje {
  titulo: string;
  mensaje: string;
  tipo: 'ok' | 'error';
}

@Component({
  selector: 'app-modal-mensaje',
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