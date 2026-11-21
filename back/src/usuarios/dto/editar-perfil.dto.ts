import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

// Lo que el usuario puede cambiar de su propio perfil (la foto viaja aparte, como archivo).
// Mismas reglas que en el registro para nombre, apellido y descripción.
export class EditarPerfilDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres.' })
  @MaxLength(50, { message: 'El nombre puede tener hasta 50 caracteres.' })
  @Matches(PATRON_NOMBRE, { message: 'El nombre solo puede tener letras, espacios, apóstrofe o guion.' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres.' })
  @MaxLength(50, { message: 'El apellido puede tener hasta 50 caracteres.' })
  @Matches(PATRON_NOMBRE, { message: 'El apellido solo puede tener letras, espacios, apóstrofe o guion.' })
  apellido: string;

  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres.' })
  @MaxLength(200, { message: 'La descripción puede tener hasta 200 caracteres.' })
  descripcion: string;
}