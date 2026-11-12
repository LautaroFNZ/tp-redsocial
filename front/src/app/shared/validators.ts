import { ValidationErrors, ValidatorFn } from '@angular/forms';

// ---------- Contraseña: 8+ caracteres, una mayúscula, un número, sin espacios ----------
export const passwordSegura: ValidatorFn = (control) => {
  const valor: string = control.value ?? '';
  const errores: ValidationErrors = {};
  if (valor.length < 8) errores['largo'] = true;
  if (!/[A-Z]/.test(valor)) errores['mayuscula'] = true;
  if (!/\d/.test(valor)) errores['numero'] = true;
  if (/\s/.test(valor)) errores['espacios'] = true;
  return Object.keys(errores).length ? errores : null;
};

export const REGLAS_PASSWORD = [
  { error: 'largo', texto: 'Mínimo 8 caracteres' },
  { error: 'mayuscula', texto: 'Al menos una mayúscula' },
  { error: 'numero', texto: 'Al menos un número' },
  { error: 'espacios', texto: 'Sin espacios' },
];

// ---------- Repetir contraseña (validador de grupo) ----------
export const coincidenPasswords: ValidatorFn = (grupo) => {
  const password = grupo.get('password')?.value;
  const repetir = grupo.get('repetirPassword')?.value;
  return password && repetir && password !== repetir ? { noCoinciden: true } : null;
};

// ---------- Nombre y apellido: letras (con tildes y ñ), espacios, apóstrofe y guion ----------
export const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

// ---------- Correo con dominio y extensión (Validators.email acepta "a@b") ----------
export const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

// ---------- Fecha de nacimiento: válida, no futura y edad entre min y max ----------
export const EDAD_MINIMA = 13;
export const EDAD_MAXIMA = 100;

export function calcularEdad(nacimiento: Date, hoy = new Date()): number {
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

export const edadPermitida: ValidatorFn = (control) => {
  if (!control.value) return null; // de eso se encarga required
  const fecha = new Date(control.value + 'T00:00:00');
  if (isNaN(fecha.getTime())) return { fechaInvalida: true };
  if (fecha > new Date()) return { fechaFutura: true };
  const edad = calcularEdad(fecha);
  if (edad < EDAD_MINIMA) return { menorDeEdad: { minima: EDAD_MINIMA } };
  if (edad > EDAD_MAXIMA) return { edadMaxima: { maxima: EDAD_MAXIMA } };
  return null;
};

// ---------- Texto con contenido (no solo espacios) ----------
export const conContenido: ValidatorFn = (control) =>
  !control.value || String(control.value).trim() ? null : { soloEspacios: true };