var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario } from './schemas/usuario.schema.js';
let UsuariosService = class UsuariosService {
    usuarioModel;
    constructor(usuarioModel) {
        this.usuarioModel = usuarioModel;
    }
    async verificarDisponible(correo, usuario) {
        const correoNormalizado = correo.trim().toLowerCase();
        const usuarioNormalizado = usuario.trim().toLowerCase();
        const existente = await this.usuarioModel
            .findOne({ $or: [{ correo: correoNormalizado }, { usuario: usuarioNormalizado }] })
            .exec();
        if (existente) {
            const campo = existente.correo === correoNormalizado ? 'correo' : 'nombre de usuario';
            throw new ConflictException(`Ya existe una cuenta con ese ${campo}.`);
        }
    }
    crear(datos) {
        return this.usuarioModel.create(datos);
    }
    buscarParaLogin(identificador) {
        const valor = identificador.trim().toLowerCase();
        return this.usuarioModel
            .findOne({ $or: [{ correo: valor }, { usuario: valor }] })
            .select('+password')
            .exec();
    }
};
UsuariosService = __decorate([
    Injectable(),
    __param(0, InjectModel(Usuario.name)),
    __metadata("design:paramtypes", [Model])
], UsuariosService);
export { UsuariosService };
//# sourceMappingURL=usuarios.service.js.map