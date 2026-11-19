import { Pipe, PipeTransform } from '@angular/core';

// Corta un texto largo y le agrega "…" (sin cortar a mitad de palabra si se puede)
export function recortar(texto: string | null | undefined, maximo = 24): string {
  if (!texto) return '';
  const limpio = texto.trim();
  if (limpio.length <= maximo) return limpio;
  const corte = limpio.slice(0, maximo - 1);
  const ultimoEspacio = corte.lastIndexOf(' ');
  // si hay un espacio cerca del final, cortamos ahí para no dejar media palabra
  return (ultimoEspacio > maximo * 0.6 ? corte.slice(0, ultimoEspacio) : corte).trimEnd() + '…';
}

// Pipe propio: {{ publicacion.titulo | recortar:30 }}
@Pipe({ name: 'recortar' })
export class RecortarPipe implements PipeTransform {
  transform(texto: string | null | undefined, maximo = 24): string {
    return recortar(texto, maximo);
  }
}