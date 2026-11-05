import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
