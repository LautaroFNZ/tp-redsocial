import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../archivos/file.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import type { TokenPayload } from './token-payload.js';

const EDAD_MINIMA = 13;
const EDAD_MAXIMA = 100;

function calcularEdad(nacimiento: Date, hoy = new Date()): number {
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}


@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly fileService: FileService,
    private readonly jwtService: JwtService,
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
    const usuario = await this.usuariosService.crear({
      ...dto,
      fechaNacimiento: nacimiento,
      password,
      foto: fotoUrl,
      perfil: 'usuario',
    });

    // Al registrarse, ya queda logueado: devolvemos el usuario y su token
    const token = await this.firmarToken(usuario);
    return { usuario, token };
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

    // Devuelve los datos del usuario (el toJSON del schema quita la contraseña) y el token
    const token = await this.firmarToken(usuario);
    return { usuario, token };
  }

  // POST /auth/autorizar: el guard ya validó el token; devolvemos los datos frescos del usuario
  async autorizar(id: string) {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario) {
      throw new UnauthorizedException('La sesión ya no es válida.');
    }
    if (!usuario.activo) {
      throw new ForbiddenException('Tu cuenta está deshabilitada.');
    }
    return usuario;
  }

  // POST /auth/refrescar: el guard ya validó el token; firmamos uno nuevo con la misma info
  async refrescar(payload: TokenPayload) {
    const token = await this.jwtService.signAsync({
      sub: payload.sub,
      usuario: payload.usuario,
      perfil: payload.perfil,
    });
    return { token };
  }

  // Arma y firma el token con lo que la consigna pide: quién es y su rol
  private firmarToken(usuario: UsuarioDocument) {
    const payload: TokenPayload = {
      sub: String(usuario._id),
      usuario: usuario.usuario,
      perfil: usuario.perfil,
    };
    return this.jwtService.signAsync(payload);
  }
}