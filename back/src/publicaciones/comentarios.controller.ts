import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ComentariosService } from './comentarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';
import { PaginacionDto } from './dto/paginacion.dto.js';
import { ParseMongoIdPipe } from '../common/parse-mongo-id.pipe.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { UsuarioId } from '../auth/usuario-actual.decorator.js';

// Comentarios controller (dentro del módulo publicaciones, como pide la consigna)
@Controller()
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // GET /publicaciones/:id/comentarios?offset=0&limit=5 → 200 (público)
  @Get('publicaciones/:id/comentarios')
  listar(@Param('id', ParseMongoIdPipe) id: string, @Query() paginacion: PaginacionDto) {
    return this.comentariosService.listar(id, paginacion);
  }

  // POST /publicaciones/:id/comentarios → 201. El autor sale del token.
  @Post('publicaciones/:id/comentarios')
  @UseGuards(AuthGuard)
  crear(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: CrearComentarioDto,
    @UsuarioId() autorId: string,
  ) {
    return this.comentariosService.crear(id, dto, autorId);
  }

  // PUT /comentarios/:id → 200 (marca modificado: true). El usuario sale del token.
  @Put('comentarios/:id')
  @UseGuards(AuthGuard)
  editar(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() dto: EditarComentarioDto,
    @UsuarioId() usuarioId: string,
  ) {
    return this.comentariosService.editar(id, dto, usuarioId);
  }
}