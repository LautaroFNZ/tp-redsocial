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
import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Publicacion } from './schemas/publicacion.schema.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../archivos/file.service.js';
const CAMPOS_AUTOR = 'nombre apellido usuario foto perfil descripcion';
let PublicacionesService = class PublicacionesService {
    publicacionModel;
    usuariosService;
    fileService;
    constructor(publicacionModel, usuariosService, fileService) {
        this.publicacionModel = publicacionModel;
        this.usuariosService = usuariosService;
        this.fileService = fileService;
    }
    async crear(dto, imagen) {
        await this.usuarioActivo(dto.autor);
        const imagenUrl = imagen
            ? await this.fileService.cloudinaryUploader(imagen, 'publicaciones')
            : null;
        const creada = await this.publicacionModel.create({
            titulo: dto.titulo,
            mensaje: dto.mensaje,
            imagen: imagenUrl,
            autor: new Types.ObjectId(dto.autor),
        });
        return creada.populate('autor', CAMPOS_AUTOR);
    }
    async listar(filtros) {
        const { orden = 'fecha', usuario, offset = 0, limit = 5 } = filtros;
        const filtro = { activa: true };
        if (usuario)
            filtro.autor = new Types.ObjectId(usuario);
        const ordenamiento = orden === 'meGusta'
            ? { cantidadMeGusta: -1, createdAt: -1 }
            : { createdAt: -1 };
        const [publicaciones, total] = await Promise.all([
            this.publicacionModel
                .find(filtro)
                .sort(ordenamiento)
                .skip(offset)
                .limit(limit)
                .populate('autor', CAMPOS_AUTOR)
                .exec(),
            this.publicacionModel.countDocuments(filtro).exec(),
        ]);
        return { publicaciones, total, offset, limit };
    }
    async obtener(id) {
        const publicacion = await this.publicacionModel
            .findOne({ _id: id, activa: true })
            .populate('autor', CAMPOS_AUTOR)
            .exec();
        if (!publicacion)
            throw new NotFoundException('La publicación no existe.');
        return publicacion;
    }
    async eliminar(id, usuarioId) {
        const usuario = await this.usuarioActivo(usuarioId);
        const publicacion = await this.publicacionModel.findOne({ _id: id, activa: true }).exec();
        if (!publicacion)
            throw new NotFoundException('La publicación no existe.');
        const esAutor = publicacion.autor.equals(usuario._id);
        if (!esAutor && usuario.perfil !== 'administrador') {
            throw new ForbiddenException('Solo el autor o un administrador pueden eliminar esta publicación.');
        }
        publicacion.activa = false;
        await publicacion.save();
    }
    async darMeGusta(id, usuarioId) {
        await this.usuarioActivo(usuarioId);
        const usuario = new Types.ObjectId(usuarioId);
        const actualizada = await this.publicacionModel
            .findOneAndUpdate({ _id: id, activa: true, meGusta: { $ne: usuario } }, { $addToSet: { meGusta: usuario }, $inc: { cantidadMeGusta: 1 } }, { new: true })
            .populate('autor', CAMPOS_AUTOR)
            .exec();
        if (!actualizada) {
            await this.existeOFalla(id);
            throw new ConflictException('Ya le hiciste luces a esta publicación.');
        }
        return actualizada;
    }
    async quitarMeGusta(id, usuarioId) {
        await this.usuarioActivo(usuarioId);
        const usuario = new Types.ObjectId(usuarioId);
        const actualizada = await this.publicacionModel
            .findOneAndUpdate({ _id: id, activa: true, meGusta: usuario }, { $pull: { meGusta: usuario }, $inc: { cantidadMeGusta: -1 } }, { new: true })
            .populate('autor', CAMPOS_AUTOR)
            .exec();
        if (!actualizada) {
            await this.existeOFalla(id);
            throw new ConflictException('No le habías hecho luces a esta publicación.');
        }
        return actualizada;
    }
    async usuarioActivo(id) {
        const usuario = await this.usuariosService.buscarPorId(id);
        if (!usuario)
            throw new NotFoundException('El usuario no existe.');
        if (!usuario.activo)
            throw new ForbiddenException('El usuario está deshabilitado.');
        return usuario;
    }
    async existeOFalla(id) {
        const existe = await this.publicacionModel.exists({ _id: id, activa: true });
        if (!existe)
            throw new NotFoundException('La publicación no existe.');
    }
};
PublicacionesService = __decorate([
    Injectable(),
    __param(0, InjectModel(Publicacion.name)),
    __metadata("design:paramtypes", [Model,
        UsuariosService,
        FileService])
], PublicacionesService);
export { PublicacionesService };
//# sourceMappingURL=publicaciones.service.js.map