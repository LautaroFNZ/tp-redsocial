import { Component, computed, input } from '@angular/core';
import { Usuario } from '../modelos';
import { colorDeUsuario } from '../colores';
import { ImagenRespaldo } from '../directivas/imagen-respaldo.directive';

@Component({
  selector: 'app-avatar',
  imports: [ImagenRespaldo],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  usuario = input.required<Pick<Usuario, 'nombre' | 'apellido' | 'usuario' | 'foto'>>();
  tamano = input(54);
  forma = input<'redondo' | 'carnet'>('redondo'); // carnet: foto rectangular 3x4 (la licencia de la Ruta)

  alto = computed(() => (this.forma() === 'carnet' ? Math.round(this.tamano() * 1.3) : this.tamano()));

  iniciales = computed(() => (this.usuario().nombre[0] + this.usuario().apellido[0]).toUpperCase());
  color = computed(() => colorDeUsuario(this.usuario().usuario));
}