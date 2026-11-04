import { Publicacion, Usuario } from './modelos';

// Sprint 1: datos de prueba hasta que el back devuelva los reales.
export const USUARIO_ACTUAL: Usuario = {
  nombre: 'Gaetano',
  apellido: 'Russo',
  correo: 'tano.gti@mail.com',
  usuario: 'tano_gti',
  fechaNacimiento: '1996-03-14',
  descripcion: 'Gol GTI 89 y un 147 que no arranca nunca. Banfield.',
  perfil: 'usuario',
};

const RULO: Usuario = {
  nombre: 'Raúl',
  apellido: 'Gómez',
  correo: 'rulo@mail.com',
  usuario: 'el_rulo128',
  fechaNacimiento: '1990-07-22',
  descripcion: 'Fiat 128 Europa, mantenido a pulmón.',
  perfil: 'usuario',
};

const MARIO: Usuario = {
  nombre: 'Mario',
  apellido: 'Pereyra',
  correo: 'mario@mail.com',
  usuario: 'falcon_mario',
  fechaNacimiento: '1978-01-09',
  descripcion: 'Falcon 81 y el club de los domingos.',
  perfil: 'usuario',
};

export const PUBLICACIONES: Publicacion[] = [
  {
    id: 1, autor: USUARIO_ACTUAL, fecha: '2026-11-03T18:30:00', meGusta: 128,
    titulo: 'Gol GTI 89, primera salida',
    mensaje: 'Después de 2 años en la cochera volvió a rodar. Ruta 2 hasta Chascomús y vuelta.',
    comentarios: [
      { autor: 'el_rulo128', texto: 'Qué lindo que quedó ese rojo. ¿Lo pintaste vos?' },
      { autor: 'falcon_mario', texto: 'La próxima avisá y caemos con los del club.' },
    ],
  },
  {
    id: 2, autor: RULO, fecha: '2026-11-02T11:00:00', meGusta: 210,
    titulo: 'Escape artesanal para el 128',
    mensaje: 'Lo hizo un vecino con caños de la ferretería. Suena como un Fórmula 1 de los 70.',
    comentarios: [{ autor: 'tano_gti', texto: '¡Subí un video que lo quiero escuchar!' }],
  },
  {
    id: 3, autor: USUARIO_ACTUAL, fecha: '2026-10-30T20:15:00', meGusta: 96,
    titulo: 'Llantas BBS nuevas',
    mensaje: 'Las conseguí en Mercado Libre, usadas pero impecables.',
    comentarios: [],
  },
  {
    id: 4, autor: MARIO, fecha: '2026-10-28T09:40:00', meGusta: 340,
    titulo: 'Falcon 81 restaurado',
    mensaje: 'Tres años de laburo los fines de semana. Chapa, pintura y motor a nuevo.',
    comentarios: [
      { autor: 'tano_gti', texto: 'Una joya, Mario.' },
      { autor: 'el_rulo128', texto: 'Ese color es el original?' },
    ],
  },
  {
    id: 5, autor: USUARIO_ACTUAL, fecha: '2026-10-20T17:00:00', meGusta: 54,
    titulo: 'Juntada en Costanera',
    mensaje: 'Más de 40 autos el domingo. La próxima es en Monte.',
    comentarios: [],
  },
  {
    id: 6, autor: USUARIO_ACTUAL, fecha: '2026-10-12T14:20:00', meGusta: 41,
    titulo: '147 en la fosa otra vez',
    mensaje: 'Burro de arranque. Clásico.',
    comentarios: [{ autor: 'falcon_mario', texto: 'Pegale un martillazo, siempre funciona.' }],
  },
  {
    id: 7, autor: USUARIO_ACTUAL, fecha: '2026-10-01T10:00:00', meGusta: 77,
    titulo: 'Restauré el tablero',
    mensaje: 'Instrumental nuevo y luces que andan todas por primera vez.',
    comentarios: [],
  },
];