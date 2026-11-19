import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { UsuarioDocument } from '../usuarios/schemas/usuario.schema.js';
import type { TokenPayload } from './token-payload.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  // POST /auth/registro: las validaciones, la foto y el hash están en UsuariosService.registrar
  // (el mismo método que usa el admin desde el dashboard). Acá el perfil siempre es "usuario".
  async registro(dto: RegistroDto, foto?: Express.Multer.File) {
    const usuario = await this.usuariosService.registrar(dto, 'usuario', foto);

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