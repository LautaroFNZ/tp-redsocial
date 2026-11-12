import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

// Parámetros de GET /publicaciones?orden=…&usuario=…&offset=…&limit=…
export class ListarPublicacionesDto {
  @IsOptional()
  @IsIn(['fecha', 'meGusta'], { message: 'El orden puede ser "fecha" o "meGusta".' })
  orden?: 'fecha' | 'meGusta';

  @IsOptional()
  @IsMongoId({ message: 'El usuario no es válido.' })
  usuario?: string;

  @IsOptional()
  @Type(() => Number) // los query params llegan como texto
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20, { message: 'Se pueden pedir hasta 20 publicaciones por vez.' })
  limit?: number;
}