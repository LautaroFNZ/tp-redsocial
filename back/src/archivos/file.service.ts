import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cloudinaryPkg from 'cloudinary';
import { randomUUID } from 'node:crypto';

const cloudinary = cloudinaryPkg.v2;

@Injectable()
export class FileService {
  constructor(config: ConfigService) {
    // Igual que el material, pero las credenciales salen del .env
    cloudinary.config({
      cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  }

  cloudinaryUploader(file: Express.Multer.File, carpeta = 'usuarios'): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `garagehub/${carpeta}`,
          public_id: randomUUID(), // id único: así dos fotos con el mismo nombre no se pisan
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(new InternalServerErrorException('No se pudo subir la foto a Cloudinary.'));
          } else if (!result?.secure_url) {
            reject(new InternalServerErrorException('Cloudinary no devolvió la URL de la foto.'));
          } else {
            resolve(result.secure_url);
          }
        },
      );

      stream.on('error', () => {
        reject(new InternalServerErrorException('No se pudo enviar la foto a Cloudinary.'));
      });

      stream.end(file.buffer);
    });
  }
}