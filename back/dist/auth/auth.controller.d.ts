import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { TokenPayload } from './token-payload.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    autorizar(req: Request & {
        user: TokenPayload;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../usuarios/schemas/usuario.schema.js").Usuario, {}, import("mongoose").DefaultSchemaOptions> & import("../usuarios/schemas/usuario.schema.js").Usuario & {
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
    refrescar(req: Request & {
        user: TokenPayload;
    }): Promise<{
        token: string;
    }>;
}
