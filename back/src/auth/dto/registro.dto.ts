import { IsDateString, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegistroDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(50)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MaxLength(50)
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
  password: string;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida.' })
  fechaNacimiento: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @MaxLength(200)
  descripcion: string;
}