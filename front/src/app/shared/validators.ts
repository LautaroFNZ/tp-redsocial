import { ValidationErrors, ValidatorFn } from '@angular/forms';

// Contraseña: mínimo 8 caracteres, una mayúscula y un número.
// Devuelve un error por cada regla que no se cumple, así el form las muestra en vivo.
export const passwordSegura: ValidatorFn = (control) => {
  const valor: string = control.value ?? '';
  const errores: ValidationErrors = {};
  if (valor.length < 8) errores['largo'] = true;
  if (!/[A-Z]/.test(valor)) errores['mayuscula'] = true;
  if (!/\d/.test(valor)) errores['numero'] = true;
  return Object.keys(errores).length ? errores : null;
};

export const REGLAS_PASSWORD = [
  { error: 'largo', texto: 'Mínimo 8 caracteres' },
  { error: 'mayuscula', texto: 'Al menos una mayúscula' },
  { error: 'numero', texto: 'Al menos un número' },
];

// Validador de grupo: compara password y repetirPassword.
export const coincidenPasswords: ValidatorFn = (grupo) => {
  const password = grupo.get('password')?.value;
  const repetir = grupo.get('repetirPassword')?.value;
  return password && repetir && password !== repetir ? { noCoinciden: true } : null;
};

export const fechaPasada: ValidatorFn = (control) => {
  if (!control.value) return null;
  return new Date(control.value) > new Date() ? { fechaFutura: true } : null;
};