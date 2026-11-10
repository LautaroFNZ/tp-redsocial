import { IsDateString, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

export class RegistroDto {
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

  @IsEmail({}, { message: 'El correo no es válido.' })
  correo: string;

  @IsString()
  @MinLength(3, { message: 'El usuario debe tener al menos 3 caracteres.' })
  @MaxLength(15, { message: 'El usuario puede tener hasta 15 caracteres.' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'El usuario solo puede tener letras, números y guion bajo.' })
  usuario: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @Matches(/[A-Z]/, { message: 'La contraseña necesita al menos una mayúscula.' })
  @Matches(/\d/, { message: 'La contraseña necesita al menos un número.' })
  @Matches(/^\S+$/, { message: 'La contraseña no puede tener espacios.' })
  password: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida.' })
  fechaNacimiento: string;

  @IsString()
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres.' })
  @MaxLength(200, { message: 'La descripción puede tener hasta 200 caracteres.' })
  descripcion: string;
}