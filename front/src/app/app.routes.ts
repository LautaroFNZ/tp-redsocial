import { Routes } from '@angular/router';
import { conSesion, sinSesion } from './guards/sesion.guard';

export const routes: Routes = [
  // Pantalla de carga: valida el token y redirige a la ruta o al login
  {
    path: '',
    pathMatch: 'full',
    title: 'GarageHub',
    loadComponent: () => import('./pages/cargando/cargando').then(m => m.Cargando),
  },

  {
    path: 'login',
    title: 'Ingresar · GarageHub',
    canActivate: [sinSesion],
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'registro',
    title: 'Registro · GarageHub',
    canActivate: [sinSesion],
    loadComponent: () => import('./pages/registro/registro').then(m => m.Registro),
  },

  // pantallas internas: comparten el menú lateral y exigen sesión
  {
    path: '',
    canActivate: [conSesion],
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    children: [
      {
        path: 'publicaciones',
        title: 'Ruta · GarageHub',
        loadComponent: () => import('./pages/publicaciones/publicaciones').then(m => m.Publicaciones),
      },
      {
        path: 'publicar',
        title: 'Publicar · GarageHub',
        loadComponent: () => import('./pages/publicar/publicar').then(m => m.Publicar),
      },
      {
        path: 'mi-perfil',
        title: 'Mi garage · GarageHub',
        loadComponent: () => import('./pages/mi-perfil/mi-perfil').then(m => m.MiPerfil),
      },
      {
        path: 'garage/:usuario',
        title: 'Garage · GarageHub',
        loadComponent: () => import('./pages/mi-perfil/mi-perfil').then(m => m.MiPerfil),
      },
      {
        path: 'publicacion/:id',
        title: 'Publicación · GarageHub',
        loadComponent: () => import('./pages/publicacion-detalle/publicacion-detalle').then(m => m.PublicacionDetalle),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];