import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TokenPayload } from './token-payload.js';

export const UsuarioId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<{ user: TokenPayload }>();
  return request.user.sub;
});