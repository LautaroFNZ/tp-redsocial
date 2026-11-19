import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema.js';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema.js';
import { Usuario } from '../usuarios/schemas/usuario.schema.js';
import { RangoFechasDto } from './dto/rango-fechas.dto.js';

const ZONA = 'America/Argentina/Buenos_Aires';
const DIAS_POR_DEFECTO = 30;
const MAX_PUBLICACIONES = 8; // en la torta, más de 8 porciones no se leen

// En NestJS los servicios se declaran con @Injectable()
@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
  ) {}

    // ---------- GET /estadisticas/publicaciones-por-usuario ----------
  // Publicaciones activas hechas en el lapso (las dadas de baja no cuentan, igual que en el resto de la app)
  publicacionesPorUsuario(rango: RangoFechasDto) {
    const { desde, hasta } = this.armarRango(rango);
    return this.publicacionModel.aggregate<{ usuario: string; cantidad: number }>([
      { $match: { activa: true, createdAt: { $gte: desde, $lte: hasta } } },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $lookup: { from: this.coleccionUsuarios, localField: '_id', foreignField: '_id', as: 'autor' } },
      { $unwind: '$autor' },
      { $project: { _id: 0, usuario: '$autor.usuario', cantidad: 1 } },
      { $sort: { cantidad: -1, usuario: 1 } },
    ]);
  }

  // ---------- GET /estadisticas/comentarios-por-dia ----------
  // Agrupa por día (hora de Argentina) para dibujar una línea en el tiempo.
  // Solo comentarios de publicaciones activas: si la publicación se dio de baja, sus comentarios tampoco cuentan
  comentariosPorDia(rango: RangoFechasDto) {
    const { desde, hasta } = this.armarRango(rango);
    return this.comentarioModel.aggregate<{ fecha: string; cantidad: number }>([
      { $match: { createdAt: { $gte: desde, $lte: hasta } } },
      { $lookup: { from: this.publicacionModel.collection.name, localField: 'publicacion', foreignField: '_id', as: 'publicacion' } },
      { $unwind: '$publicacion' },
      { $match: { 'publicacion.activa': true } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: ZONA } },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
      { $sort: { fecha: 1 } },
    ]);
  }

  // ---------- GET /estadisticas/comentarios-por-publicacion ----------
  // Comentarios hechos en el lapso, agrupados por publicación (solo publicaciones activas)
  comentariosPorPublicacion(rango: RangoFechasDto) {
    const { desde, hasta } = this.armarRango(rango);
    return this.comentarioModel.aggregate<{ publicacion: string; titulo: string; cantidad: number }>([
      { $match: { createdAt: { $gte: desde, $lte: hasta } } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      { $lookup: { from: this.publicacionModel.collection.name, localField: '_id', foreignField: '_id', as: 'publicacion' } },
      { $unwind: '$publicacion' },
      { $match: { 'publicacion.activa': true } },
      { $project: { _id: 0, publicacion: '$_id', titulo: '$publicacion.titulo', cantidad: 1 } },
      { $sort: { cantidad: -1 } },
      { $limit: MAX_PUBLICACIONES },
    ]);
  }

  // Nombre real de la colección de usuarios en Mongo (Mongoose lo pluraliza solo),
  // así el $lookup no depende de adivinarlo
  private get coleccionUsuarios() {
    return this.publicacionModel.db.model(Usuario.name).collection.name;
  }

  // "2026-11-01" → desde las 00:00 de ese día; "2026-11-18" → hasta las 23:59:59 (hora de Argentina)
  private armarRango({ desde, hasta }: RangoFechasDto) {
    const fin = hasta ? new Date(`${hasta}T23:59:59.999-03:00`) : new Date();
    const inicio = desde
      ? new Date(`${desde}T00:00:00.000-03:00`)
      : new Date(fin.getTime() - DIAS_POR_DEFECTO * 24 * 60 * 60 * 1000);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new BadRequestException('Alguna de las fechas no es válida.');
    }
    if (inicio > fin) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta".');
    }
    return { desde: inicio, hasta: fin };
  }
}