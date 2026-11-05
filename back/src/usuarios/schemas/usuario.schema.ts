import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema({ timestamps: true }) // agrega createdAt y updatedAt
export class Usuario {
  @Prop({ required: true, trim: true, maxlength: 50 })
  nombre: string;

  @Prop({ required: true, trim: true, maxlength: 50 })
  apellido: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  correo: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  usuario: string;

  // select: false → no viene en las consultas salvo que se pida explícitamente
  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ required: true, trim: true, maxlength: 200 })
  descripcion: string;

  @Prop({ type: String, default: null })
  foto: string | null;

  @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil: string;

  // para la baja lógica del sprint 4
  @Prop({ default: true })
  activo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

// Nunca devolver la contraseña (ni __v) en las respuestas JSON
UsuarioSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password, __v, ...resto } = ret;
    return resto;
  },
});