import { Component, ElementRef, effect, input, viewChild } from '@angular/core';
import {
  ArcElement, BarController, BarElement, CategoryScale, Chart, ChartType, Filler,
  Legend, LineController, LineElement, LinearScale, PieController, PointElement, Tooltip,
} from 'chart.js';
import { recortar } from '../../shared/pipes/recortar.pipe';

// Registramos solo lo que usamos (barras, línea y torta): así el bundle pesa menos
Chart.register(
  BarController, BarElement, LineController, LineElement, PointElement, PieController, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
);

// Fuente y color por defecto de todos los gráficos (los de la app)
Chart.defaults.font.family = "'Space Grotesk', sans-serif";
Chart.defaults.color = '#111111';

const MAX_ETIQUETA = 22;   // caracteres visibles en ejes y leyenda
const ANCHO_TOOLTIP = 32;  // caracteres por renglón en el cartelito al pasar el mouse

// Parte un texto largo en renglones para el tooltip (así se lee el título completo sin salirse del gráfico)
function enRenglones(texto: string, ancho = ANCHO_TOOLTIP): string[] {
  const renglones: string[] = [];
  let actual = '';
  for (const palabra of texto.split(' ')) {
    if (actual && (actual + ' ' + palabra).length > ancho) {
      renglones.push(actual);
      actual = palabra;
    } else {
      actual = actual ? actual + ' ' + palabra : palabra;
    }
  }
  if (actual) renglones.push(actual);
  return renglones;
}

const PALETA = ['#FFD21F', '#7CC8F0', '#F6A04D', '#2FB35A', '#E0413B', '#2457F5', '#C8C5BD', '#8A8D94'];

// Componente reutilizable: recibe tipo, etiquetas y valores, y dibuja un gráfico de Chart.js en un <canvas>
@Component({
  selector: 'app-grafico',
  template: `<div class="lienzo"><canvas #lienzo [attr.aria-label]="titulo()" role="img"></canvas></div>`,
  styles: `
    :host { display: block; }
    .lienzo { position: relative; height: 260px; }
  `,
})
export class Grafico {
  tipo = input.required<ChartType>();
  etiquetas = input.required<string[]>();
  valores = input.required<number[]>();
  titulo = input('');

  private lienzo = viewChild.required<ElementRef<HTMLCanvasElement>>('lienzo');

  constructor() {
    // Cada vez que cambian los datos se vuelve a dibujar; el cleanup destruye el gráfico anterior
    // (Chart.js no deja crear dos gráficos sobre el mismo canvas)
    effect(onCleanup => {
      const tipo = this.tipo();
      const etiquetas = this.etiquetas();
      const chart = new Chart(this.lienzo().nativeElement, {
        type: tipo,
        data: {
          // En ejes y leyenda van recortadas; el texto completo se ve en el tooltip
          labels: etiquetas.map(e => recortar(e, MAX_ETIQUETA)),
          datasets: [{
            label: this.titulo(),
            data: this.valores(),
            backgroundColor: tipo === 'line' ? 'rgba(224, 65, 59, 0.15)' : PALETA,
            borderColor: tipo === 'line' ? '#E0413B' : '#111111',
            borderWidth: tipo === 'line' ? 3 : 2,
            fill: tipo === 'line',
            tension: 0.3,
            pointBackgroundColor: '#E0413B',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: tipo === 'pie',
              position: 'bottom',
              labels: { boxWidth: 14 },
            },
            tooltip: {
              callbacks: {
                // El título completo (del array original), partido en renglones
                title: items => (items[0] ? enRenglones(etiquetas[items[0].dataIndex] ?? '') : []),
              },
            },
          },
          scales: tipo === 'pie' ? {} : {
            x: { ticks: { autoSkip: true, maxRotation: 45 } },
            y: { beginAtZero: true, ticks: { precision: 0 } },
          },
        },
      });
      onCleanup(() => chart.destroy());
    });
  }
}