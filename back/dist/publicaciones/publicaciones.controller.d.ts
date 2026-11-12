import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto.js';
import { AccionUsuarioDto } from './dto/accion-usuario.dto.js';
export declare class PublicacionesController {
    private readonly publicacionesService;
    constructor(publicacionesService: PublicacionesService);
    crear(dto: CrearPublicacionDto, imagen?: Express.Multer.File): Promise<import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>, {}, import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>>;
    listar(filtros: ListarPublicacionesDto): Promise<{
        publicaciones: (import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & {
            id: string;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        total: number;
        offset: number;
        limit: number;
    }>;
    eliminar(id: string, dto: AccionUsuarioDto): Promise<void>;
    darMeGusta(id: string, dto: AccionUsuarioDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    quitarMeGusta(id: string, dto: AccionUsuarioDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("./schemas/publicacion.schema.js").Publicacion, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/publicacion.schema.js").Publicacion & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
