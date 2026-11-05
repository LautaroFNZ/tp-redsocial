import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../archivos/file.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly fileService: FileService,
  ) {}

  async registro(dto: RegistroDto, foto?: Express.Multer.File) {
    // 1. Correo y usuario únicos (si no, 409)
    await this.usuariosService.verificarDisponible(dto.correo, dto.usuario);

    // 2. Foto a Cloudinary (opcional)
    const fotoUrl = foto ? await this.fileService.cloudinaryUploader(foto) : null;

    // 3. Contraseña encriptada
    const password = await bcrypt.hash(dto.password, 10);

    // 4. Guardar. El perfil siempre arranca como "usuario"
    return this.usuariosService.crear({
      ...dto,
      fechaNacimiento: new Date(dto.fechaNacimiento),
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