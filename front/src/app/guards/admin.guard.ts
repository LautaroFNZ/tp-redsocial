import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from '../services/sesion';

// Taller: solo administradores. Si no lo es, vuelve a la Ruta.
// (Es una protección de pantalla; la seguridad de verdad está en el back con el AdminGuard)
export const esAdmin: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  return sesion.usuario()?.perfil === 'administrador' ? true : router.createUrlTree(['/publicaciones']);
};