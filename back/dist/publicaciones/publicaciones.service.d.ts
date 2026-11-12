import { Model, Types } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../archivos/file.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
export declare class PublicacionesService {
    private readonly publicacionModel;
    private readonly usuariosService;
    private readonly fileService;
    constructor(publicacionModel: Model<PublicacionDocument>, usuariosService: UsuariosService, fileService: FileService);
    crear(dto: CrearPublicacionDto, imagen?: Express.Multer.File): Promise<import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    listar(filtros: ListarPublicacionesDto): Promise<{
        publicaciones: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        } & Required<{
            _id: Types.ObjectId;
        }>)[];
        total: number;
        offset: number;
        limit: number;
    }>;
    obtener(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    eliminar(id: string, usuarioId: string): Promise<void>;
    darMeGusta(id: string, usuarioId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    quitarMeGusta(id: string, usuarioId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Publicacion, {}, import("mongoose").DefaultSchemaOptions> & Publicacion & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    private usuarioActivo;
    private existeOFalla;
}
