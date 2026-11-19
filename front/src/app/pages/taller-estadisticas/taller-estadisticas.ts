import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EstadisticasApi } from '../../services/estadisticas-api';
import {
  ComentariosPorDia, ComentariosPorPublicacion, PublicacionesPorUsuario, RangoFechas,
} from '../../shared/modelos';
import { mensajeDeError } from '../../shared/mensaje-error';
import { Grafico } from '../../components/grafico/grafico';
import { Mensaje, ModalMensaje } from '../../shared/modal-mensaje/modal-mensaje';

// Fecha local en formato AAAA-MM-DD (toISOString usa UTC y a la noche ya sería "mañana")
function fechaLocal(fecha = new Date()): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function haceDias(dias: number): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fechaLocal(fecha);
}

// Validador de grupo: "desde" no puede ser posterior a "hasta"
const rangoValido: ValidatorFn = grupo => {
  const desde = grupo.get('desde')?.value;
  const hasta = grupo.get('hasta')?.value;
  return desde && hasta && desde > hasta ? { rangoInvertido: true } : null;
};

const MAX_PORCIONES = 7;
type Atajo = 0 | 6 | 29 | 89; // días hacia atrás desde hoy (hoy = 0, 7 días = hoy + los 6 anteriores)

@Component({
  selector: 'app-taller-estadisticas',
  imports: [ReactiveFormsModule, Grafico, ModalMensaje],
  templateUrl: './taller-estadisticas.html',
  styleUrl: './taller-estadisticas.scss',
})
export class TallerEstadisticas {
  private fb = inject(FormBuilder);
  private api = inject(EstadisticasApi);

  readonly hoy = fechaLocal();
  readonly atajos: { dias: Atajo; texto: string }[] = [
    { dias: 0, texto: 'Hoy' },
    { dias: 6, texto: '7 días' },
    { dias: 29, texto: '30 días' },
    { dias: 89, texto: '90 días' },
  ];

  // Formulario reactivo del lapso; arranca en "30 días"
  form = this.fb.nonNullable.group(
    {
      desde: [haceDias(29), Validators.required],
      hasta: [this.hoy, Validators.required],
    },
    { validators: rangoValido },
  );

  atajo = signal<Atajo | null>(29);
  cargando = signal(false);
  modal = signal<Mensaje | null>(null);

  porUsuario = signal<PublicacionesPorUsuario[]>([]);
  porDia = signal<ComentariosPorDia[]>([]);
  porPublicacion = signal<ComentariosPorPublicacion[]>([]);

   // Torta: publicaciones por usuario. Más de 7 porciones no se leen,
  // así que mostramos los 7 que más publicaron y el resto se suma en "Otros"
  tortaUsuarios = computed(() => {
    const lista = this.porUsuario(); // ya viene ordenada de mayor a menor
    const primeros = lista.slice(0, MAX_PORCIONES);
    const otros = lista.slice(MAX_PORCIONES).reduce((suma, p) => suma + p.cantidad, 0);
    return {
      etiquetas: [...primeros.map(p => p.usuario), ...(otros ? ['Otros'] : [])],
      valores: [...primeros.map(p => p.cantidad), ...(otros ? [otros] : [])],
    };
  });

  // Barras: comentarios por publicación (el back ya devuelve las más comentadas, máximo 8)
  barrasPublicaciones = computed(() => ({
    etiquetas: this.porPublicacion().map(p => p.titulo),
    valores: this.porPublicacion().map(p => p.cantidad),
  }));

  // El back solo devuelve los días con comentarios: completamos los días vacíos con 0
  // para que la línea muestre el lapso entero y no "salte" días
  linea = computed(() => {
    const { desde, hasta } = this.rangoAplicado();
    const cantidades = new Map(this.porDia().map(d => [d.fecha, d.cantidad]));
    const etiquetas: string[] = [];
    const valores: number[] = [];
    for (let dia = new Date(desde + 'T00:00:00'); fechaLocal(dia) <= hasta; dia.setDate(dia.getDate() + 1)) {
      const clave = fechaLocal(dia);
      etiquetas.push(clave.slice(8, 10) + '/' + clave.slice(5, 7)); // dd/mm
      valores.push(cantidades.get(clave) ?? 0);
    }
    return { etiquetas, valores };
  });

  totalPublicaciones = computed(() => this.porUsuario().reduce((suma, p) => suma + p.cantidad, 0));
  totalComentarios = computed(() => this.porDia().reduce((suma, d) => suma + d.cantidad, 0));

  private rangoAplicado = signal<RangoFechas>(this.form.getRawValue());
  private pedido = 0; // ignora respuestas viejas si se cambia el lapso rápido

  constructor() {
    this.cargar();
  }

  elegirAtajo(dias: Atajo) {
    this.atajo.set(dias);
    this.form.setValue({ desde: haceDias(dias), hasta: this.hoy });
    this.cargar();
  }

  // Cambio a mano en las fechas: deja de estar marcado el atajo
  cambioManual() {
    this.atajo.set(null);
    this.cargar();
  }

  cargar() {
    if (this.form.invalid) return; // el template ya muestra el error

    const rango = this.form.getRawValue();
    const numero = ++this.pedido;
    this.cargando.set(true);

    // Los 3 pedidos en paralelo; forkJoin espera a que terminen todos
    forkJoin({
      porUsuario: this.api.publicacionesPorUsuario(rango),
      porDia: this.api.comentariosPorDia(rango),
      porPublicacion: this.api.comentariosPorPublicacion(rango),
    }).subscribe({
      next: datos => {
        if (numero !== this.pedido) return;
        this.rangoAplicado.set(rango);
        this.porUsuario.set(datos.porUsuario);
        this.porDia.set(datos.porDia);
        this.porPublicacion.set(datos.porPublicacion);
        this.cargando.set(false);
      },
      error: error => {
        if (numero !== this.pedido) return;
        this.cargando.set(false);
        this.modal.set({ tipo: 'error', titulo: 'No pudimos leer el tablero', mensaje: mensajeDeError(error) });
      },
    });
  }
}