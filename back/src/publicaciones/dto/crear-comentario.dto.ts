import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío.' })
  @MaxLength(300, { message: 'El comentario puede tener hasta 300 caracteres.' })
  mensaje: string;

  // Sprint 3 (provisorio): viaja en el pedido hasta que se defina el token
  @IsMongoId({ message: 'El autor no es válido.' })
  autor: string;
}