import { IsOptional, Matches } from 'class-validator';

const FECHA = /^\d{4}-\d{2}-\d{2}$/; // AAAA-MM-DD, lo que manda un <input type="date">

// ?desde=2026-11-01&hasta=2026-11-18 (los dos opcionales; por defecto, los últimos 30 días)
export class RangoFechasDto {
  @IsOptional()
  @Matches(FECHA, { message: 'La fecha "desde" tiene que tener el formato AAAA-MM-DD.' })
  desde?: string;

  @IsOptional()
  @Matches(FECHA, { message: 'La fecha "hasta" tiene que tener el formato AAAA-MM-DD.' })
  hasta?: string;
}