import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema.js';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';
import { PaginacionDto } from './dto/paginacion.dto.js';

const CAMPOS_AUTOR = 'nombre apellido usuario foto perfil';

// En NestJS los servicios se declaran con @Injectable()
@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name)
    private readonly comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    private readonly usuariosService: UsuariosService,
  ) {}

  // ---------- GET /publicaciones/:id/comentarios ----------
  async listar(publicacionId: string, { offset = 0, limit = 5 }: PaginacionDto) {
    await this.publicacionActivaOFalla(publicacionId);
    const filtro = { publicacion: new Types.ObjectId(publicacionId) };

    const [comentarios, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1 }) // los más recientes primero
        .skip(offset)
        .limit(limit)
        .populate('autor', CAMPOS_AUTOR)
        .exec(),
      this.comentarioModel.countDocuments(filtro).exec(),
    ]);

    return { comentarios, total, offset, limit };
  }

  // ---------- POST /publicaciones/:id/comentarios ----------
  async crear(publicacionId: string, dto: CrearComentarioDto) {
    await this.publicacionActivaOFalla(publicacionId);
    await this.usuarioActivo(dto.autor);

    const creado = await this.comentarioModel.create({
      publicacion: new Types.ObjectId(publicacionId),
      autor: new Types.ObjectId(dto.autor),
      mensaje: dto.mensaje,
    });

    // suma 1 al contador de la publicación
    await this.publicacionModel.updateOne({ _id: publicacionId }, { $inc: { cantidadComentarios: 1 } });

    return creado.populate('autor', CAMPOS_AUTOR);
  }

  // ---------- PUT /comentarios/:id ----------
  async editar(comentarioId: string, dto: EditarComentarioDto) {
    const comentario = await this.comentarioModel.findById(comentarioId).exec();
    if (!comentario) throw new NotFoundException('El comentario no existe.');

    if (!comentario.autor.equals(new Types.ObjectId(dto.usuario))) {
      throw new ForbiddenException('Solo el autor puede editar este comentario.');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;
    await comentario.save();

    return comentario.populate('autor', CAMPOS_AUTOR);
  }

  // ---------- auxiliares ----------
  private async publicacionActivaOFalla(id: string) {
    const existe = await this.publicacionModel.exists({ _id: id, activa: true });
    if (!existe) throw new NotFoundException('La publicación no existe.');
  }

  private async usuarioActivo(id: string) {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario) throw new NotFoundException('El usuario no existe.');
    if (!usuario.activo) throw new ForbiddenException('El usuario está deshabilitado.');
    return usuario;
  }
}