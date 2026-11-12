import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true }) // createdAt = fecha de publicación
export class Publicacion {
  @Prop({ required: true, trim: true, maxlength: 80 })
  titulo: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  mensaje: string;

  @Prop({ type: String, default: null })
  imagen: string | null;

  // Referencia al usuario que la creó (se completa con populate)
  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor: Types.ObjectId;

  // Ids de los usuarios que dieron me gusta: garantiza uno por usuario
  @Prop({ type: [{ type: Types.ObjectId, ref: Usuario.name }], default: [] })
  meGusta: Types.ObjectId[];

  // Contador aparte para poder ordenar por cantidad de me gusta
  @Prop({ default: 0 })
  cantidadMeGusta: number;

  // Contador para mostrar cuántos comentarios tiene sin tener que contarlos
  @Prop({ default: 0 })
  cantidadComentarios: number;

  // Baja lógica
  @Prop({ default: true })
  activa: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);

PublicacionSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v, ...resto } = ret;
    return resto;
  },
});