import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param,
  Post, Query, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe.js';
import { opcionesImagen } from '../archivos/opciones-imagen.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { UsuarioId } from '../auth/usuario-actual.decorator.js';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  // POST /publicaciones → 201. El autor sale del token, no del body.
  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('imagen', opcionesImagen(4)))
  crear(
    @Body() dto: CrearPublicacionDto,
    @UsuarioId() autorId: string,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(dto, autorId, imagen);
  }

  // GET /publicaciones?orden=fecha|meGusta&usuario=<id>&offset=0&limit=5 → 200 (público)
  @Get()
  listar(@Query() filtros: ListarPublicacionesDto) {
    return this.publicacionesService.listar(filtros);
  }

  // GET /publicaciones/:id → 200, 404 si no existe o fue dada de baja (público)
  @Get(':id')
  obtener(@Param('id', ParseMongoIdPipe) id: string) {
    return this.publicacionesService.obtener(id);
  }

  // DELETE /publicaciones/:id → 204 (baja lógica). El usuario sale del token.
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  eliminar(@Param('id', ParseMongoIdPipe) id: string, @UsuarioId() usuarioId: string) {
    return this.publicacionesService.eliminar(id, usuarioId);
  }

  // POST /publicaciones/:id/me-gusta → 201. El usuario sale del token.
  @Post(':id/me-gusta')
  @UseGuards(AuthGuard)
  darMeGusta(@Param('id', ParseMongoIdPipe) id: string, @UsuarioId() usuarioId: string) {
    return this.publicacionesService.darMeGusta(id, usuarioId);
  }

  // DELETE /publicaciones/:id/me-gusta → 200. El usuario sale del token.
  @Delete(':id/me-gusta')
  @UseGuards(AuthGuard)
  quitarMeGusta(@Param('id', ParseMongoIdPipe) id: string, @UsuarioId() usuarioId: string) {
    return this.publicacionesService.quitarMeGusta(id, usuarioId);
  }
}