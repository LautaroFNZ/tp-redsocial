import { Component, computed, input } from '@angular/core';

export type TipoLuz =
  | 'motor'      // check engine → error
  | 'posicion'   // luces de posición → éxito
  | 'luces'      // luces altas → me gusta
  | 'bujia'      // precalentamiento → cargando
  | 'nafta'      // reserva → sesión por vencer
  | 'mano'       // freno de mano → confirmar borrado
  | 'llave'      // inmovilizador → usuario deshabilitado
  | 'cinturon';  // cinturón → sin sesión

const COLORES: Record<TipoLuz, string> = {
  motor: '#F5A623',
  posicion: '#2FD16A',
  luces: '#3B7BFF',
  bujia: '#F5A623',
  nafta: '#F5A623',
  mano: '#FF4A3D',
  llave: '#FF4A3D',
  cinturon: '#FF4A3D',
};

const NOMBRES: Record<TipoLuz, string> = {
  motor: 'Check engine',
  posicion: 'Luces de posición',
  luces: 'Luces altas',
  bujia: 'Precalentamiento',
  nafta: 'Reserva de nafta',
  mano: 'Freno de mano',
  llave: 'Inmovilizador',
  cinturon: 'Cinturón',
};

@Component({
  selector: 'app-luz-testigo',
  templateUrl: './luz-testigo.html',
  styleUrl: './luz-testigo.scss',
})
export class LuzTestigo {
  tipo = input.required<TipoLuz>();
  encendida = input(true);
  tamano = input(40);
  marco = input(true); // círculo negro de tablero alrededor

  color = computed(() => (this.encendida() ? COLORES[this.tipo()] : '#C9CCD2'));
  nombre = computed(() => NOMBRES[this.tipo()]);
}