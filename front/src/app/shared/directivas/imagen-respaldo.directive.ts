import { Directive, ElementRef, Renderer2, inject, input } from '@angular/core';

// Directiva de atributo: si la imagen no carga (link roto, Cloudinary caído, sin internet),
// la reemplaza por una imagen de respaldo en vez de mostrar el ícono de imagen rota.
// Uso: <img [src]="foto" appImagenRespaldo>  o  <img [src]="foto" appImagenRespaldo="/otra.svg">
@Directive({
  selector: 'img[appImagenRespaldo]',
  host: { '(error)': 'alFallar()' }, // escucha el evento "error" del <img>
})
export class ImagenRespaldo {
  private elemento = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private renderer = inject(Renderer2);

  appImagenRespaldo = input<string>('');

  private yaFallo = false; // evita un bucle infinito si también falla el respaldo

  alFallar() {
    if (this.yaFallo) return;
    this.yaFallo = true;
    const respaldo = this.appImagenRespaldo() || '/favicon.svg';
    // Renderer2: modificamos el elemento sin tocar el DOM directamente
    this.renderer.setAttribute(this.elemento.nativeElement, 'src', respaldo);
    this.renderer.addClass(this.elemento.nativeElement, 'imagen-respaldo');
  }
}