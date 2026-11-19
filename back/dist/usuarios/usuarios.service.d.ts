import { Model } from 'mongoose';
import { Usuario, UsuarioDocument } from './schemas/usuario.schema.js';
import { FileService } from '../archivos/file.service.js';
import { RegistroDto } from '../auth/dto/registro.dto.js';
export declare class UsuariosService {
    private readonly usuarioModel;
    private readonly fileService;
    constructor(usuarioModel: Model<UsuarioDocument>, fileService: FileService);
    registrar(dto: RegistroDto, perfil: 'usuario' | 'administrador', foto?: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    verificarDisponible(correo: string, usuario: string): Promise<void>;
    buscarParaLogin(identificador: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    buscarPorId(id: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    buscarPublico(usuario: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    listar(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    cambiarEstado(id: string, activo: boolean, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Usuario, {}, import("mongoose").DefaultSchemaOptions> & Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
