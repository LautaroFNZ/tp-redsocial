import {
  BadRequestException, Body, Controller, HttpCode, HttpStatus,
  Post, Req, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { TokenPayload } from './token-payload.js';

const MAX_FOTO = 2 * 1024 * 1024; // 2 MB, igual que en el front

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/registro → 201 con { usuario, token }
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

  // POST /auth/login → 200 con { usuario, token }
  // (un POST devuelve 201 por defecto, pero el login no crea nada)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // POST /auth/autorizar → 200 con los datos del usuario, o 401 si el token no sirve
  // El AuthGuard valida el token antes de entrar; si falla, corta con 401
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  autorizar(@Req() req: Request & { user: TokenPayload }) {
    return this.authService.autorizar(req.user.sub);
  }

  // POST /auth/refrescar → 200 con { token } nuevo (15 min más)
  @Post('refrescar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  refrescar(@Req() req: Request & { user: TokenPayload }) {
    return this.authService.refrescar(req.user);
  }
}