import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { FileService } from '../archivos/file.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { TokenPayload } from './token-payload.js';
export declare class AuthService {
    private readonly usuariosService;
    private readonly fileService;
    private readonly jwtService;
    constructor(usuariosService: UsuariosService, fileService: FileService, jwtService: JwtService);
    registro(dto: RegistroDto, foto?: Express.Multer.File): Promise<{
        usuario: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../usuarios/schemas/usuario.schema.js").Usuario, {}, import("mongoose").DefaultSchemaOptions> & import("../usuarios/schemas/usuario.schema.js").Usuario & {
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
        }>;
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        usuario: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../usuarios/schemas/usuario.schema.js").Usuario, {}, import("mongoose").DefaultSchemaOptions> & import("../usuarios/schemas/usuario.schema.js").Usuario & {
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
        }>;
        token: string;
    }>;
    autorizar(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../usuarios/schemas/usuario.schema.js").Usuario, {}, import("mongoose").DefaultSchemaOptions> & import("../usuarios/schemas/usuario.schema.js").Usuario & {
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
    refrescar(payload: TokenPayload): Promise<{
        token: string;
    }>;
    private firmarToken;
}
