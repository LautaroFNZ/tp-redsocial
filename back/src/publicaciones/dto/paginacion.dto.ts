import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// ?offset=…&limit=… (los query params llegan como texto)
export class PaginacionDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20, { message: 'Se pueden pedir hasta 20 por vez.' })
  limit?: number;
}