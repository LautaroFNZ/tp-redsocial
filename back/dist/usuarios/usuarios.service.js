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
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Usuario } from './schemas/usuario.schema.js';
import { FileService } from '../archivos/file.service.js';
const EDAD_MINIMA = 13;
const EDAD_MAXIMA = 100;
function calcularEdad(nacimiento, hoy = new Date()) {
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate()))
        edad--;
    return edad;
}
let UsuariosService = class UsuariosService {
    usuarioModel;
    fileService;
    constructor(usuarioModel, fileService) {
        this.usuarioModel = usuarioModel;
        this.fileService = fileService;
    }
    async registrar(dto, perfil, foto) {
        const nacimiento = new Date(dto.fechaNacimiento);
        if (nacimiento > new Date()) {
            throw new BadRequestException('La fecha de nacimiento no puede ser futura.');
        }
        const edad = calcularEdad(nacimiento);
        if (edad < EDAD_MINIMA) {
            throw new BadRequestException(`Tiene que tener al menos ${EDAD_MINIMA} años.`);
        }
        if (edad > EDAD_MAXIMA) {
            throw new BadRequestException('Revisá el año de nacimiento.');
        }
        await this.verificarDisponible(dto.correo, dto.usuario);
        const fotoUrl = foto ? await this.fileService.cloudinaryUploader(foto) : null;
        const password = await bcrypt.hash(dto.password, 10);
        return this.usuarioModel.create({
            nombre: dto.nombre,
            apellido: dto.apellido,
            correo: dto.correo,
            usuario: dto.usuario,
            descripcion: dto.descripcion,
            fechaNacimiento: nacimiento,
            password,
            foto: fotoUrl,
            perfil,
        });
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
    buscarParaLogin(identificador) {
        const valor = identificador.trim().toLowerCase();
        return this.usuarioModel
            .findOne({ $or: [{ correo: valor }, { usuario: valor }] })
            .select('+password')
            .exec();
    }
    buscarPorId(id) {
        return this.usuarioModel.findById(id).exec();
    }
    buscarPublico(usuario) {
        return this.usuarioModel
            .findOne({ usuario: usuario.trim().toLowerCase(), activo: true })
            .select('nombre apellido usuario foto descripcion perfil')
            .exec();
    }
    listar() {
        return this.usuarioModel.find().sort({ createdAt: -1 }).exec();
    }
    async cambiarEstado(id, activo, adminId) {
        if (!activo && id === adminId) {
            throw new BadRequestException('No podés deshabilitar tu propia cuenta.');
        }
        const usuario = await this.usuarioModel
            .findByIdAndUpdate(id, { activo }, { new: true })
            .exec();
        if (!usuario)
            throw new NotFoundException('El usuario no existe.');
        return usuario;
    }
};
UsuariosService = __decorate([
    Injectable(),
    __param(0, InjectModel(Usuario.name)),
    __metadata("design:paramtypes", [Model,
        FileService])
], UsuariosService);
export { UsuariosService };
//# sourceMappingURL=usuarios.service.js.map