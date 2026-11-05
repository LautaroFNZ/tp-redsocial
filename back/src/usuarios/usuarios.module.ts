import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service.js';
import { Usuario, UsuarioSchema } from './schemas/usuario.schema.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }])],
  providers: [UsuariosService],
  exports: [UsuariosService], // lo usa el módulo de autenticación
})
export class UsuariosModule {}