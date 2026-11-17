import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Sesion } from './sesion';

// 1) Agrega "Authorization: Bearer <token>" a cada pedido (si hay token)
// 2) Si el back responde 401, cierra la sesión y manda al login
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  const token = sesion.token();

  // El token se agrega siempre que exista (incluye autorizar y refrescar)
  const pedido = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // El 401 de las pantallas de auth (login, registro, autorizar) lo maneja cada pantalla,
  // así que no redirigimos en esos casos
  const esDeAuth = req.url.includes('/auth/');

  return next(pedido).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !esDeAuth) {
        sesion.cerrar();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};