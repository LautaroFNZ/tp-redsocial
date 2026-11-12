import { Component, computed, input, output } from '@angular/core';
import { LuzTestigo, TipoLuz } from '../luz-testigo/luz-testigo';

export type TipoMensaje = 'ok' | 'error' | 'peligro' | 'sesion';

export interface Mensaje {
  titulo: string;
  mensaje: string;
  tipo: TipoMensaje;
}

const LUCES: Record<TipoMensaje, TipoLuz> = {
  ok: 'posicion',   // éxito
  error: 'motor',   // check engine
  peligro: 'mano',  // freno de mano: confirmar algo que no se deshace
  sesion: 'cinturon', // hace falta iniciar sesión
};

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
  tipo = input<TipoMensaje>('ok');
  textoConfirmar = input('Confirmar');

  cerrar = output<void>();
  confirmar = output<void>();

  luz = computed(() => LUCES[this.tipo()]);
}