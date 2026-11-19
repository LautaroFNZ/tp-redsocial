var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
let AuthService = class AuthService {
    usuariosService;
    jwtService;
    constructor(usuariosService, jwtService) {
        this.usuariosService = usuariosService;
        this.jwtService = jwtService;
    }
    async registro(dto, foto) {
        const usuario = await this.usuariosService.registrar(dto, 'usuario', foto);
        const token = await this.firmarToken(usuario);
        return { usuario, token };
    }
    async login(dto) {
        const usuario = await this.usuariosService.buscarParaLogin(dto.usuario);
        const passwordOk = usuario ? await bcrypt.compare(dto.password, usuario.password) : false;
        if (!usuario || !passwordOk) {
            throw new UnauthorizedException('Usuario o contraseña incorrectos.');
        }
        if (!usuario.activo) {
            throw new ForbiddenException('Tu cuenta está deshabilitada. Contactá a un administrador.');
        }
        const token = await this.firmarToken(usuario);
        return { usuario, token };
    }
    async autorizar(id) {
        const usuario = await this.usuariosService.buscarPorId(id);
        if (!usuario) {
            throw new UnauthorizedException('La sesión ya no es válida.');
        }
        if (!usuario.activo) {
            throw new ForbiddenException('Tu cuenta está deshabilitada.');
        }
        return usuario;
    }
    async refrescar(payload) {
        const token = await this.jwtService.signAsync({
            sub: payload.sub,
            usuario: payload.usuario,
            perfil: payload.perfil,
        });
        return { token };
    }
    firmarToken(usuario) {
        const payload = {
            sub: String(usuario._id),
            usuario: usuario.usuario,
            perfil: usuario.perfil,
        };
        return this.jwtService.signAsync(payload);
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsuariosService,
        JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map