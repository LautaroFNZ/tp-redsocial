import { Component, computed, input } from '@angular/core';
import { Usuario } from '../modelos';
import { colorDeUsuario } from '../colores';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
})
export class Avatar {
  usuario = input.required<Usuario>();
  tamano = input(54);

  iniciales = computed(() => (this.usuario().nombre[0] + this.usuario().apellido[0]).toUpperCase());
  color = computed(() => colorDeUsuario(this.usuario().usuario));
}