import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { TokenPayload } from './token-payload.js';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extraerToken(request);

    if (!token) {
      throw new UnauthorizedException('Falta el token de sesión.');
    }

    try {
      // verifyAsync revisa la firma y el vencimiento con el JWT_SECRET
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token);
      // dejamos el usuario en el request para poder leerlo en el controller
      (request as Request & { user: TokenPayload }).user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido o vencido.');
    }

    return true;
  }

  // Lee el header "Authorization: Bearer <token>"
  private extraerToken(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}