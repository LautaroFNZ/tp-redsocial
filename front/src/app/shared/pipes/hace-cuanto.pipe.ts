import { Pipe, PipeTransform } from '@angular/core';

// Pipe propio: muestra una fecha como "recién", "hace 5 min", "hace 2 h", "ayer"…
@Pipe({ name: 'haceCuanto' })
export class HaceCuantoPipe implements PipeTransform {
  transform(fecha: string | Date | null | undefined): string {
    if (!fecha) return '';
    const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);

    if (segundos < 60) return 'recién';
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'ayer';
    if (dias < 7) return `hace ${dias} días`;
    return new Date(fecha).toLocaleDateString('es-AR');
  }
}