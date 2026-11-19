import { IsIn } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto.js';

// Alta hecha por un administrador: mismos datos que el registro + el perfil
// (extends reutiliza todas las validaciones de RegistroDto)
export class CrearUsuarioDto extends RegistroDto {
  @IsIn(['usuario', 'administrador'], { message: 'El perfil tiene que ser "usuario" o "administrador".' })
  perfil: 'usuario' | 'administrador';
}