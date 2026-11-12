export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  usuario: string;
  fechaNacimiento: string;
  descripcion: string;
  perfil: 'usuario' | 'administrador';
  foto?: string | null;
  activo?: boolean;
}

// Datos del autor que el back devuelve con cada publicación (populate)
export type Autor = Pick<Usuario, '_id' | 'nombre' | 'apellido' | 'usuario' | 'descripcion' | 'perfil' | 'foto'>;

export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen: string | null;
  autor: Autor;
  meGusta: string[];        // ids de quienes le hicieron luces
  cantidadMeGusta: number;
  cantidadComentarios?: number; // las publicaciones viejas pueden no tenerlo
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

// Respuesta de GET /publicaciones
export interface PaginaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}

export type Orden = 'fecha' | 'meGusta';

export interface Comentario {
  _id: string;
  publicacion: string;
  autor: Autor;
  mensaje: string;
  modificado: boolean; // la consigna pide marcar los editados
  createdAt: string;
  updatedAt: string;
}

// Respuesta de GET /publicaciones/:id/comentarios
export interface PaginaComentarios {
  comentarios: Comentario[];
  total: number;
  offset: number;
  limit: number;
}