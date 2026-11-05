import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../archivos/file.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthService {
    private readonly usuariosService;
    private readonly fileService;
    constructor(usuariosService: UsuariosService, fileService: FileService);
    registro(dto: RegistroDto, foto?: Express.Multer.File): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../usuarios/schemas/usuario.schema.js").Usuario, {}, import("mongoose").DefaultSchemaOptions> & import("../usuarios/schemas/usuario.schema.js").Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("../usuarios/schemas/usuario.schema.js").Usuario, {}, import("mongoose").DefaultSchemaOptions> & import("../usuarios/schemas/usuario.schema.js").Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    login(dto: LoginDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../usuarios/schemas/usuario.schema.js").Usuario, {}, import("mongoose").DefaultSchemaOptions> & import("../usuarios/schemas/usuario.schema.js").Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("../usuarios/schemas/usuario.schema.js").Usuario, {}, import("mongoose").DefaultSchemaOptions> & import("../usuarios/schemas/usuario.schema.js").Usuario & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
