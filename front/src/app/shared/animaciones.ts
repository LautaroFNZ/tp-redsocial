import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

// Un solo lugar donde se configura GSAP: registra los plugins que usamos
// y lo exporta para que los componentes lo importen desde acá.
gsap.registerPlugin(ScrollToPlugin);

export { gsap };

// Si el usuario pidió "reducir movimiento" en su sistema, no animamos (accesibilidad)
export function reducirMovimiento(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
