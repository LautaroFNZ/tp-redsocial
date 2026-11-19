import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema.js';
import { FileService } from '../archivos/file.service.js';
import { RegistroDto } from '../auth/dto/registro.dto.js';

const EDAD_MINIMA = 13;
const EDAD_MAXIMA = 100;

function calcularEdad(nacimiento: Date, hoy = new Date()): number {
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name)
    private readonly usuarioModel: Model<UsuarioDocument>,
    private readonly fileService: FileService,
  ) {}

  // ---------- alta (la usan el registro y el dashboard del admin) ----------
  // Un solo lugar con las reglas: fecha válida, correo/usuario únicos, foto a Cloudinary y contraseña hasheada
  async registrar(dto: RegistroDto, perfil: 'usuario' | 'administrador', foto?: Express.Multer.File) {
    const nacimiento = new Date(dto.fechaNacimiento);
    if (nacimiento > new Date()) {
      throw new BadRequestException('La fecha de nacimiento no puede ser futura.');
    }
    const edad = calcularEdad(nacimiento);
    if (edad < EDAD_MINIMA) {
      throw new BadRequestException(`Tiene que tener al menos ${EDAD_MINIMA} años.`);
    }
    if (edad > EDAD_MAXIMA) {
      throw new BadRequestException('Revisá el año de nacimiento.');
    }

    await this.verificarDisponible(dto.correo, dto.usuario);

    const fotoUrl = foto ? await this.fileService.cloudinaryUploader(foto) : null;
    const password = await bcrypt.hash(dto.password, 10);

    return this.usuarioModel.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo: dto.correo,
      usuario: dto.usuario,
      descripcion: dto.descripcion,
      fechaNacimiento: nacimiento,
      password,
      foto: fotoUrl,
      perfil,
    });
  }

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

  // Busca por correo o por usuario, trayendo también la contraseña (que por defecto no viene)
  buscarParaLogin(identificador: string) {
    const valor = identificador.trim().toLowerCase();
    return this.usuarioModel
      .findOne({ $or: [{ correo: valor }, { usuario: valor }] })
      .select('+password')
      .exec();
  }

  buscarPorId(id: string) {
    return this.usuarioModel.findById(id).exec();
  }

  // Datos públicos de un garage (sin correo, fecha de nacimiento ni contraseña)
  buscarPublico(usuario: string) {
    return this.usuarioModel
      .findOne({ usuario: usuario.trim().toLowerCase(), activo: true })
      .select('nombre apellido usuario foto descripcion perfil')
      .exec();
  }

  // ---------- dashboard del administrador ----------
  // Todos los usuarios (habilitados y deshabilitados), los más nuevos primero
  listar() {
    return this.usuarioModel.find().sort({ createdAt: -1 }).exec();
  }

  // Baja lógica (activo: false) o alta lógica (activo: true)
  async cambiarEstado(id: string, activo: boolean, adminId: string) {
    if (!activo && id === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta.');
    }
    const usuario = await this.usuarioModel
      .findByIdAndUpdate(id, { activo }, { new: true })
      .exec();
    if (!usuario) throw new NotFoundException('El usuario no existe.');
    return usuario;
  }
}