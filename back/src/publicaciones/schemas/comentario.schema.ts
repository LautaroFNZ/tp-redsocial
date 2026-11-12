import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';
import { Publicacion } from './publicacion.schema.js';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true }) // createdAt = fecha del comentario
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: Publicacion.name, required: true, index: true })
  publicacion: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
  autor: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 300 })
  mensaje: string;

  // La consigna pide marcar los comentarios editados
  @Prop({ default: false })
  modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

ComentarioSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { __v, ...resto } = ret;
    return resto;
  },
});