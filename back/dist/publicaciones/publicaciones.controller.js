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
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { AccionUsuarioDto } from './dto/accion-usuario.dto.js';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe.js';
import { opcionesImagen } from '../archivos/opciones-imagen.js';
let PublicacionesController = class PublicacionesController {
    publicacionesService;
    constructor(publicacionesService) {
        this.publicacionesService = publicacionesService;
    }
    crear(dto, imagen) {
        return this.publicacionesService.crear(dto, imagen);
    }
    listar(filtros) {
        return this.publicacionesService.listar(filtros);
    }
    eliminar(id, dto) {
        return this.publicacionesService.eliminar(id, dto.usuario);
    }
    darMeGusta(id, dto) {
        return this.publicacionesService.darMeGusta(id, dto.usuario);
    }
    quitarMeGusta(id, dto) {
        return this.publicacionesService.quitarMeGusta(id, dto.usuario);
    }
};
__decorate([
    Post(),
    UseInterceptors(FileInterceptor('imagen', opcionesImagen(4))),
    __param(0, Body()),
    __param(1, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CrearPublicacionDto, Object]),
    __metadata("design:returntype", void 0)
], PublicacionesController.prototype, "crear", null);
__decorate([
    Get(),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ListarPublicacionesDto]),
    __metadata("design:returntype", void 0)
], PublicacionesController.prototype, "listar", null);
__decorate([
    Delete(':id'),
    HttpCode(HttpStatus.NO_CONTENT),
    __param(0, Param('id', ParseMongoIdPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AccionUsuarioDto]),
    __metadata("design:returntype", void 0)
], PublicacionesController.prototype, "eliminar", null);
__decorate([
    Post(':id/me-gusta'),
    __param(0, Param('id', ParseMongoIdPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AccionUsuarioDto]),
    __metadata("design:returntype", void 0)
], PublicacionesController.prototype, "darMeGusta", null);
__decorate([
    Delete(':id/me-gusta'),
    __param(0, Param('id', ParseMongoIdPipe)),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AccionUsuarioDto]),
    __metadata("design:returntype", void 0)
], PublicacionesController.prototype, "quitarMeGusta", null);
PublicacionesController = __decorate([
    Controller('publicaciones'),
    __metadata("design:paramtypes", [PublicacionesService])
], PublicacionesController);
export { PublicacionesController };
//# sourceMappingURL=publicaciones.controller.js.map