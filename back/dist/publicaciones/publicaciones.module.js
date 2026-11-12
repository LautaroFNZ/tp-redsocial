var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { ArchivosModule } from '../archivos/archivos.module.js';
let PublicacionesModule = class PublicacionesModule {
};
PublicacionesModule = __decorate([
    Module({
        imports: [
            MongooseModule.forFeature([{ name: Publicacion.name, schema: PublicacionSchema }]),
            UsuariosModule,
            ArchivosModule,
        ],
        controllers: [PublicacionesController],
        providers: [PublicacionesService],
    })
], PublicacionesModule);
export { PublicacionesModule };
//# sourceMappingURL=publicaciones.module.js.map