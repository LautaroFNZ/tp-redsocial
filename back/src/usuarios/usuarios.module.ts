import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';

@Module({
  providers: [UsuariosService]
})
export class UsuariosModule {}
