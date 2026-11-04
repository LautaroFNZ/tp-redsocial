const PALETA = ['#F6A04D', '#7CC8F0', '#2FB35A', '#FFD21F', '#E0413B'];

export function colorDeUsuario(usuario: string): string {
  let suma = 0;
  for (const letra of usuario) suma += letra.charCodeAt(0);
  return PALETA[suma % PALETA.length];
}