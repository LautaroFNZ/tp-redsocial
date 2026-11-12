import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../archivos/file.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';

// Datos del autor que se devuelven con cada publicación (sin correo ni fecha de nacimiento)
const CAMPOS_AUTOR = 'nombre apellido usuario foto perfil descripcion';

// En NestJS los servicios se declaran con @Injectable()
@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    private readonly usuariosService: UsuariosService,
    private readonly fileService: FileService,
  ) {}

  // ---------- POST /publicaciones ----------
  async crear(dto: CrearPublicacionDto, imagen?: Express.Multer.File) {
    await this.usuarioActivo(dto.autor);

    const imagenUrl = imagen
      ? await this.fileService.cloudinaryUploader(imagen, 'publicaciones')
      : null;

    const creada = await this.publicacionModel.create({
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      imagen: imagenUrl,
      autor: new Types.ObjectId(dto.autor),
    });

    return creada.populate('autor', CAMPOS_AUTOR);
  }

  // ---------- GET /publicaciones ----------
  async listar(filtros: ListarPublicacionesDto) {
    const { orden = 'fecha', usuario, offset = 0, limit = 5 } = filtros;

    const filtro: Record<string, unknown> = { activa: true };
    if (usuario) filtro.autor = new Types.ObjectId(usuario);

    const ordenamiento: Record<string, SortOrder> =
      orden === 'meGusta'
        ? { cantidadMeGusta: -1, createdAt: -1 } // a igual cantidad, la más nueva primero
        : { createdAt: -1 };

    const [publicaciones, total] = await Promise.all([
      this.publicacionModel
        .find(filtro)
        .sort(ordenamiento)
        .skip(offset)
        .limit(limit)
        .populate('autor', CAMPOS_AUTOR)
        .exec(),
      this.publicacionModel.countDocuments(filtro).exec(),
    ]);

    return { publicaciones, total, offset, limit };
  }

  // ---------- GET /publicaciones/:id ----------
  async obtener(id: string) {
    const publicacion = await this.publicacionModel
      .findOne({ _id: id, activa: true })
      .populate('autor', CAMPOS_AUTOR)
      .exec();
    if (!publicacion) throw new NotFoundException('La publicación no existe.');
    return publicacion;
  }

  // ---------- DELETE /publicaciones/:id (baja lógica) ----------
  async eliminar(id: string, usuarioId: string) {
    const usuario = await this.usuarioActivo(usuarioId);

    const publicacion = await this.publicacionModel.findOne({ _id: id, activa: true }).exec();
    if (!publicacion) throw new NotFoundException('La publicación no existe.');

    const esAutor = publicacion.autor.equals(usuario._id);
    if (!esAutor && usuario.perfil !== 'administrador') {
      throw new ForbiddenException('Solo el autor o un administrador pueden eliminar esta publicación.');
    }

    publicacion.activa = false;
    await publicacion.save();
  }

  // ---------- POST /publicaciones/:id/me-gusta ----------
  async darMeGusta(id: string, usuarioId: string) {
    await this.usuarioActivo(usuarioId);
    const usuario = new Types.ObjectId(usuarioId);

    // Una sola operación: solo actualiza si el usuario todavía no está en la lista
    const actualizada = await this.publicacionModel
      .findOneAndUpdate(
        { _id: id, activa: true, meGusta: { $ne: usuario } },
        { $addToSet: { meGusta: usuario }, $inc: { cantidadMeGusta: 1 } },
        { new: true },
      )
      .populate('autor', CAMPOS_AUTOR)
      .exec();

    if (!actualizada) {
      await this.existeOFalla(id);
      throw new ConflictException('Ya le hiciste luces a esta publicación.');
    }
    return actualizada;
  }

  // ---------- DELETE /publicaciones/:id/me-gusta ----------
  async quitarMeGusta(id: string, usuarioId: string) {
    await this.usuarioActivo(usuarioId);
    const usuario = new Types.ObjectId(usuarioId);

    // Solo actualiza si el usuario estaba en la lista
    const actualizada = await this.publicacionModel
      .findOneAndUpdate(
        { _id: id, activa: true, meGusta: usuario },
        { $pull: { meGusta: usuario }, $inc: { cantidadMeGusta: -1 } },
        { new: true },
      )
      .populate('autor', CAMPOS_AUTOR)
      .exec();

    if (!actualizada) {
      await this.existeOFalla(id);
      throw new ConflictException('No le habías hecho luces a esta publicación.');
    }
    return actualizada;
  }

  // ---------- auxiliares ----------
  private async usuarioActivo(id: string) {
    const usuario = await this.usuariosService.buscarPorId(id);
    if (!usuario) throw new NotFoundException('El usuario no existe.');
    if (!usuario.activo) throw new ForbiddenException('El usuario está deshabilitado.');
    return usuario;
  }

  private async existeOFalla(id: string) {
    const existe = await this.publicacionModel.exists({ _id: id, activa: true });
    if (!existe) throw new NotFoundException('La publicación no existe.');
  }
}