import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

// Valida que un parámetro de la URL sea un id de MongoDB antes de consultar la base
@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, string> {
  transform(valor: string): string {
    if (!isValidObjectId(valor)) {
      throw new BadRequestException(`"${valor}" no es un id válido.`);
    }
    return valor;
  }
}