import { Service, computed, signal } from '@angular/core';
import { Usuario } from '../shared/modelos';

const CLAVE_USUARIO = 'garagehub.usuario';
const CLAVE_TOKEN = 'garagehub.token';

// Opción A: guarda el usuario y su token JWT en localStorage
@Service()
export class Sesion {
  private actual = signal<Usuario | null>(this.leerUsuario());
  private tokenActual = signal<string | null>(this.leerToken());

  usuario = this.actual.asReadonly();
  token = this.tokenActual.asReadonly();
  logueado = computed(() => !!this.tokenActual());

  iniciar(usuario: Usuario, token: string) {
    this.actual.set(usuario);
    this.tokenActual.set(token);
    try {
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
      localStorage.setItem(CLAVE_TOKEN, token);
    } catch { /* sin storage: queda en memoria */ }
  }

  // Al refrescar solo cambia el token; el usuario sigue igual
  actualizarToken(token: string) {
    this.tokenActual.set(token);
    try { localStorage.setItem(CLAVE_TOKEN, token); } catch { /* nada */ }
  }

  cerrar() {
    this.actual.set(null);
    this.tokenActual.set(null);
    try {
      localStorage.removeItem(CLAVE_USUARIO);
      localStorage.removeItem(CLAVE_TOKEN);
    } catch { /* nada que borrar */ }
  }

  private leerUsuario(): Usuario | null {
    try {
      const guardado = localStorage.getItem(CLAVE_USUARIO);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  }

  private leerToken(): string | null {
    try { return localStorage.getItem(CLAVE_TOKEN); } catch { return null; }
  }
}