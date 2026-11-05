import {
  BadRequestException, Body, Controller, HttpCode, HttpStatus,
  Post, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';

const MAX_FOTO = 2 * 1024 * 1024; // 2 MB, igual que en el front

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/registro → 201 con los datos del usuario (sin la contraseña)
  @Post('registro')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FOTO },
      fileFilter: (_req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
          callback(null, true);
        } else {
          callback(new BadRequestException('La foto tiene que ser una imagen.'), false);
        }
      },
    }),
  )
  registro(@Body() dto: RegistroDto, @UploadedFile() foto?: Express.Multer.File) {
    return this.authService.registro(dto, foto);
  }

  // POST /auth/login → 200 con los datos del usuario
  // (un POST devuelve 201 por defecto, pero el login no crea nada)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}