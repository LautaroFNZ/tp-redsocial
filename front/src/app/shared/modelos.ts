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