import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { TokenPayload } from './token-payload.js';

// Se usa DESPUÉS del AuthGuard: @UseGuards(AuthGuard, AdminGuard)
// El AuthGuard ya validó el token y dejó el payload en request.user;
// acá solo miramos el rol que viaja adentro del token.
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: TokenPayload }>();

    if (request.user?.perfil !== 'administrador') {
      // 403: el token es válido (sabemos quién es), pero no tiene permiso
      throw new ForbiddenException('Solo un administrador puede hacer esto.');
    }
    return true;
  }
}