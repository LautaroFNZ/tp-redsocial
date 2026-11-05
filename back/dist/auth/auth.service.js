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
import bcrypt from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../archivos/file.service.js';
let AuthService = class AuthService {
    usuariosService;
    fileService;
    constructor(usuariosService, fileService) {
        this.usuariosService = usuariosService;
        this.fileService = fileService;
    }
    async registro(dto, foto) {
        await this.usuariosService.verificarDisponible(dto.correo, dto.usuario);
        const fotoUrl = foto ? await this.fileService.cloudinaryUploader(foto) : null;
        const password = await bcrypt.hash(dto.password, 10);
        return this.usuariosService.crear({
            ...dto,
            fechaNacimiento: new Date(dto.fechaNacimiento),
            password,
            foto: fotoUrl,
            perfil: 'usuario',
        });
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
        return usuario;
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsuariosService,
        FileService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map