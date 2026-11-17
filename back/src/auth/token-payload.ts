// Lo que guardamos dentro del JWT: quién es el usuario y su rol (lo pide la consigna).
// iat y exp los agrega la librería (emitido en / vence en).
export interface TokenPayload {
  sub: string;      // id del usuario
  usuario: string;  // nombre de usuario
  perfil: string;   // 'usuario' | 'administrador'
  iat?: number;
  exp?: number;
}