import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../archivos/file.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

const EDAD_MINIMA = 13;
const EDAD_MAXIMA = 100;

function calcularEdad(nacimiento: Date, hoy = new Date()): number {
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

// En NestJS los servicios se declaran con @Injectable() (no existe @Service(), que es de Angular)
@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly fileService: FileService,
  ) {}

  async registro(dto: RegistroDto, foto?: Express.Multer.File) {
    // 0. Fecha de nacimiento: no futura y edad permitida (si no, 400)
    const nacimiento = new Date(dto.fechaNacimiento);
    if (nacimiento > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser futura.');
    }
    const edad = calcularEdad(nacimiento);
    if (edad < EDAD_MINIMA) {
      throw new BadRequestException(`Tenés que tener al menos ${EDAD_MINIMA} años.`);
    }
    if (edad > EDAD_MAXIMA) {
      throw new BadRequestException('Revisá el año de nacimiento.');
    }

    // 1. Correo y usuario únicos (si no, 409)
    await this.usuariosService.verificarDisponible(dto.correo, dto.usuario);

    // 2. Foto a Cloudinary (opcional)
    const fotoUrl = foto ? await this.fileService.cloudinaryUploader(foto) : null;

    // 3. Contraseña encriptada
    const password = await bcrypt.hash(dto.password, 10);

    // 4. Guardar. El perfil siempre arranca como "usuario"
    return this.usuariosService.crear({
      ...dto,
      fechaNacimiento: nacimiento,
      password,
      foto: fotoUrl,
      perfil: 'usuario',
    });
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarParaLogin(dto.usuario);

    // bcrypt.compare encripta la contraseña recibida y la compara con el hash guardado
    const passwordOk = usuario ? await bcrypt.compare(dto.password, usuario.password) : false;

    if (!usuario || !passwordOk) {
      // mismo mensaje en los dos casos: no revelamos si el usuario existe
      throw new UnauthorizedException('Usuario o contraseña incorrectos.');
    }

    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada. Contactá a un administrador.');
    }

    // Devuelve todos los datos del usuario (el toJSON del schema quita la contraseña)
    return usuario;
  }
}