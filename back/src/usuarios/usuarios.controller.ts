import {
  Body, Controller, Delete, Get, NotFoundException, Param,
  Post, HttpCode, HttpStatus, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';
import { UsuarioId } from '../auth/usuario-actual.decorator.js';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe.js';
import { opcionesImagen } from '../archivos/opciones-imagen.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // ---------- solo administrador (primero valida el token, después el rol) ----------

  // GET /usuarios → 200 con el listado completo
  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  listar() {
    return this.usuariosService.listar();
  }

  // POST /usuarios → 201 con el usuario creado (el admin elige el perfil)
  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('foto', opcionesImagen(2)))
  crear(@Body() dto: CrearUsuarioDto, @UploadedFile() foto?: Express.Multer.File) {
    const { perfil, ...datos } = dto;
    return this.usuariosService.registrar(datos, perfil, foto);
  }

  // DELETE /usuarios/:id → 200 con el usuario deshabilitado (baja lógica)
  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  deshabilitar(@Param('id', ParseMongoIdPipe) id: string, @UsuarioId() adminId: string) {
    return this.usuariosService.cambiarEstado(id, false, adminId);
  }

  // POST /usuarios/:id/habilitar → 200 con el usuario habilitado (alta lógica)
  // (POST devuelve 201 por defecto, pero acá no se crea nada)
  @Post(':id/habilitar')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard, AdminGuard)
  habilitar(@Param('id', ParseMongoIdPipe) id: string, @UsuarioId() adminId: string) {
    return this.usuariosService.cambiarEstado(id, true, adminId);
  }

  // ---------- con sesión ----------

  // GET /usuarios/:usuario → 200 con los datos públicos del garage, 404 si no existe
  @Get(':usuario')
  @UseGuards(AuthGuard)
  async verGarage(@Param('usuario') usuario: string) {
    const encontrado = await this.usuariosService.buscarPublico(usuario);
    if (!encontrado) throw new NotFoundException('No existe un garage con ese usuario.');
    return encontrado;
  }
}