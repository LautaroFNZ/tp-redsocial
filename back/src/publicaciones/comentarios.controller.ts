import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';
import { PaginacionDto } from './dto/paginacion.dto.js';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe.js';

// Comentarios controller (dentro del módulo publicaciones, como pide la consigna)
@Controller()
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // GET /publicaciones/:id/comentarios?offset=0&limit=5 → 200
  @Get('publicaciones/:id/comentarios')
  listar(@Param('id', ParseMongoIdPipe) id: string, @Query() paginacion: PaginacionDto) {
    return this.comentariosService.listar(id, paginacion);
  }

  // POST /publicaciones/:id/comentarios → 201
  @Post('publicaciones/:id/comentarios')
  crear(@Param('id', ParseMongoIdPipe) id: string, @Body() dto: CrearComentarioDto) {
    return this.comentariosService.crear(id, dto);
  }

  // PUT /comentarios/:id → 200 (marca modificado: true)
  @Put('comentarios/:id')
  editar(@Param('id', ParseMongoIdPipe) id: string, @Body() dto: EditarComentarioDto) {
    return this.comentariosService.editar(id, dto);
  }
}