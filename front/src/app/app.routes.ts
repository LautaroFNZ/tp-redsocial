import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    title: 'Ingresar · GarageHub',
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'registro',
    title: 'Registro · GarageHub',
    loadComponent: () => import('./pages/registro/registro').then(m => m.Registro),
  },

  // pantallas internas: comparten el menú lateral
  {
    path: '',
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
    ],
  },

  { path: '**', redirectTo: 'login' },
];