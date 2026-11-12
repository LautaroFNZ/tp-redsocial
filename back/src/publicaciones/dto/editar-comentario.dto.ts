import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EditarComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El comentario no puede estar vacío.' })
  @MaxLength(300, { message: 'El comentario puede tener hasta 300 caracteres.' })
  mensaje: string;

  // Quién edita (provisorio hasta el token)
  @IsMongoId({ message: 'El usuario no es válido.' })
  usuario: string;
}