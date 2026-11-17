import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from '../services/sesion';

// Pantallas internas: sin sesión, al login
export const conSesion: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  return sesion.logueado() ? true : router.createUrlTree(['/login']);
};

// Login y registro: si ya hay sesión, a la ruta
export const sinSesion: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  return sesion.logueado() ? router.createUrlTree(['/publicaciones']) : true;
};