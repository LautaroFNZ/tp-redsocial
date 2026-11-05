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
import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
const MAX_FOTO = 2 * 1024 * 1024;
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    registro(dto, foto) {
        return this.authService.registro(dto, foto);
    }
    login(dto) {
        return this.authService.login(dto);
    }
};
__decorate([
    Post('registro'),
    UseInterceptors(FileInterceptor('foto', {
        storage: memoryStorage(),
        limits: { fileSize: MAX_FOTO },
        fileFilter: (_req, file, callback) => {
            if (file.mimetype.startsWith('image/')) {
                callback(null, true);
            }
            else {
                callback(new BadRequestException('La foto tiene que ser una imagen.'), false);
            }
        },
    })),
    __param(0, Body()),
    __param(1, UploadedFile()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegistroDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registro", null);
__decorate([
    Post('login'),
    HttpCode(HttpStatus.OK),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
AuthController = __decorate([
    Controller('auth'),
    __metadata("design:paramtypes", [AuthService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map