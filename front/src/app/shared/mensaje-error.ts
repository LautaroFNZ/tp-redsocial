import { HttpErrorResponse } from '@angular/common/http';

// Convierte la respuesta de error del back en un texto para el modal
export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No pudimos conectar con el servidor. Probá de nuevo en un rato.';
    }
    const mensaje = error.error?.message;
    if (Array.isArray(mensaje)) return mensaje.join(' '); // errores del ValidationPipe
    if (typeof mensaje === 'string') return mensaje;
  }
  return 'Ocurrió un error inesperado. Probá de nuevo.';
}