import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

// Configuración de Multer para recibir una imagen en memoria (como en el material)
export function opcionesImagen(maxMb: number) {
  return {
    storage: memoryStorage(),
    limits: { fileSize: maxMb * 1024 * 1024 }, // más grande → 413
    fileFilter: (
      _req: unknown,
      file: { mimetype: string },
      callback: (error: Error | null, aceptar: boolean) => void,
    ) => {
      if (file.mimetype.startsWith('image/')) {
        callback(null, true);
      } else {
        callback(new BadRequestException('El archivo tiene que ser una imagen.'), false);
      }
    },
  };
}