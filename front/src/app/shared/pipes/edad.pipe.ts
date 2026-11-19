import { Pipe, PipeTransform } from '@angular/core';
import { calcularEdad } from '../validators';

// Pipe propio: transforma una fecha de nacimiento en la edad actual → "34 años"
// (reutiliza calcularEdad, la misma función del validador del registro)
@Pipe({ name: 'edad' })
export class EdadPipe implements PipeTransform {
  transform(fechaNacimiento: string | Date | null | undefined): string {
    if (!fechaNacimiento) return '';
    const fecha = new Date(fechaNacimiento);
    if (isNaN(fecha.getTime())) return '';
    // la fecha viene guardada a las 00:00 UTC: armamos la fecha local con esos datos
    // para que en Argentina (UTC-3) no "retroceda" un día
    const local = new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
    const edad = calcularEdad(local);
    return `${edad} ${edad === 1 ? 'año' : 'años'}`;
  }
}