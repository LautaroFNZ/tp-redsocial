import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param,
  Post, Query, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { AccionUsuarioDto } from './dto/accion-usuario.dto.js';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe.js';
import { opcionesImagen } from '../archivos/opciones-imagen.js';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // POST /publicaciones → 201
  @Post()
  @UseInterceptors(FileInterceptor('imagen', opcionesImagen(4)))
  crear(@Body() dto: CrearPublicacionDto, @UploadedFile() imagen?: Express.Multer.File) {
    return this.publicacionesService.crear(dto, imagen);
  }

  // GET /publicaciones?orden=fecha|meGusta&usuario=<id>&offset=0&limit=5 → 200
  @Get()
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  // GET /publicaciones/:id → 200, 404 si no existe o fue dada de baja
  @Get(':id')
  obtener(@Param('id', ParseMongoIdPipe) id: string) {
    return this.publicacionesService.obtener(id);
  }

  // DELETE /publicaciones/:id → 204 (baja lógica)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseMongoIdPipe) id: string, @Body() dto: AccionUsuarioDto) {
    return this.publicacionesService.eliminar(id, dto.usuario);
  }

  // POST /publicaciones/:id/me-gusta → 201
  @Post(':id/me-gusta')
  darMeGusta(@Param('id', ParseMongoIdPipe) id: string, @Body() dto: AccionUsuarioDto) {
    return this.publicacionesService.darMeGusta(id, dto.usuario);
  }

  // DELETE /publicaciones/:id/me-gusta → 200
  @Delete(':id/me-gusta')
  quitarMeGusta(@Param('id', ParseMongoIdPipe) id: string, @Body() dto: AccionUsuarioDto) {
    return this.publicacionesService.quitarMeGusta(id, dto.usuario);
  }
}