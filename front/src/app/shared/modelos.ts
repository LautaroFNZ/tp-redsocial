export interface Usuario {
  nombre: string;
  apellido: string;
  correo: string;
  usuario: string;
  fechaNacimiento: string;
  descripcion: string;
  perfil: 'usuario' | 'administrador';
  foto?: string | null;
}

export interface Comentario {
  autor: string;
  texto: string;
}

export interface Publicacion {
  id: number;
  autor: Usuario;
  titulo: string;
  mensaje: string;
  imagen?: string | null;
  fecha: string;
  meGusta: number;
  comentarios: Comentario[];
}