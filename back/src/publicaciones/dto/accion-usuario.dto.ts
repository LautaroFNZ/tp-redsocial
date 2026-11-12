import { IsMongoId } from 'class-validator';

// Quién hace la acción (me gusta / borrar). Sprint 3: sale del token.
export class AccionUsuarioDto {
  @IsMongoId({ message: 'El usuario no es válido.' })
  usuario: string;
}