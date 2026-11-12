import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // GET /usuarios/:usuario → 200 con los datos públicos del garage, 404 si no existe
  @Get(':usuario')
  async verGarage(@Param('usuario') usuario: string) {
    const encontrado = await this.usuariosService.buscarPublico(usuario);
    if (!encontrado) throw new NotFoundException('No existe un garage con ese usuario.');
    return encontrado;
  }
}