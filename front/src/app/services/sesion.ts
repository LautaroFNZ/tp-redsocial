import { Injectable, signal } from '@angular/core';
import { Usuario } from '../shared/modelos';

const CLAVE = 'garagehub.usuario';

// Sprint 1: guarda los datos públicos del usuario que devolvió el login.
// Sprint 3: se reemplaza por el JWT en cookie.
@Injectable({ providedIn: 'root' })
export class Sesion {
  private actual = signal<Usuario | null>(this.leer());
  usuario = this.actual.asReadonly();

  iniciar(usuario: Usuario) {
    this.actual.set(usuario);
    try { localStorage.setItem(CLAVE, JSON.stringify(usuario)); } catch { /* sin storage: queda en memoria */ }
  }

  cerrar() {
    this.actual.set(null);
    try { localStorage.removeItem(CLAVE); } catch { /* nada que borrar */ }
  }

  private leer(): Usuario | null {
    try {
      const guardado = localStorage.getItem(CLAVE);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  }
}