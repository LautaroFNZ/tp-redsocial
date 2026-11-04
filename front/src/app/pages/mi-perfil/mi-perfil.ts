import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PUBLICACIONES, USUARIO_ACTUAL } from '../../shared/datos-mock';
import { Avatar } from '../../shared/avatar/avatar';
import { Patente } from '../../shared/patente/patente';
import { FotoAuto } from '../../shared/foto-auto/foto-auto';

@Component({
  selector: 'app-mi-perfil',
  imports: [DatePipe, Avatar, Patente, FotoAuto],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.scss',
})
export class MiPerfil {
  usuario = USUARIO_ACTUAL;

  publicaciones = PUBLICACIONES
    .filter(p => p.autor.usuario === this.usuario.usuario)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Completa la última fila de 3 con cocheras libres
  libres = Array((3 - (this.publicaciones.length % 3)) % 3);
}