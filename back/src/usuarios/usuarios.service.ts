import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<UsuarioDocument>,
  ) {}

  // El correo y el nombre de usuario tienen que ser únicos
  async verificarDisponible(correo: string, usuario: string) {
    const correoNormalizado = correo.trim().toLowerCase();
    const usuarioNormalizado = usuario.trim().toLowerCase();

    const existente = await this.usuarioModel
      .findOne({ $or: [{ correo: correoNormalizado }, { usuario: usuarioNormalizado }] })
      .exec();

    if (existente) {
      const campo = existente.correo === correoNormalizado ? 'correo' : 'nombre de usuario';
      throw new ConflictException(`Ya existe una cuenta con ese ${campo}.`);
    }
  }

  crear(datos: Partial<Usuario>) {
    return this.usuarioModel.create(datos);
  }

  // Busca por correo o por usuario, trayendo también la contraseña (que por defecto no viene)
  buscarParaLogin(identificador: string) {
    const valor = identificador.trim().toLowerCase();
    return this.usuarioModel
      .findOne({ $or: [{ correo: valor }, { usuario: valor }] })
      .select('+password')
      .exec();
  }
}