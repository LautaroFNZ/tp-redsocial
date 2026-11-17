import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { ArchivosModule } from '../archivos/archivos.module.js';

@Module({
  imports: [
    UsuariosModule,
    ArchivosModule,
    // Configura el JWT: la clave sale del .env y el token vence a los 15 minutos (lo pide la consigna)
    JwtModule.registerAsync({
      global: true, // así JwtService está disponible en toda la app
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard], // para poder usar el guard en otros módulos más adelante
})
export class AuthModule {}