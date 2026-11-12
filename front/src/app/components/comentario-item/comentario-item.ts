import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComentariosApi } from '../../services/comentarios-api';
import { Sesion } from '../../services/sesion';
import { Comentario } from '../../shared/modelos';
import { conContenido } from '../../shared/validators';
import { mensajeDeError } from '../../shared/mensaje-error';
import { HaceCuantoPipe } from '../../shared/pipes/hace-cuanto.pipe';

@Component({
  selector: 'app-comentario-item',
  imports: [ReactiveFormsModule, HaceCuantoPipe],
  templateUrl: './comentario-item.html',
  styleUrl: './comentario-item.scss',
})
export class ComentarioItem {
  private api = inject(ComentariosApi);
  private sesion = inject(Sesion);

  comentario = input.required<Comentario>();
  compacto = input(false);          // en la Ruta: sin botón de editar
  actualizado = output<Comentario>(); // avisa al padre el comentario editado

  editando = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);

  texto = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(300), conContenido],
  });

  // Solo el autor puede editar
  esMio = computed(() => this.sesion.usuario()?._id === this.comentario().autor._id);

  empezar() {
    this.texto.setValue(this.comentario().mensaje);
    this.error.set(null);
    this.editando.set(true);
  }

  cancelar() {
    this.editando.set(false);
  }

  guardar() {
    const usuario = this.sesion.usuario();
    if (!usuario) return;
    if (this.texto.invalid) {
      this.error.set('El comentario no puede estar vacío.');
      return;
    }

    this.guardando.set(true);
    this.api.editar(this.comentario()._id, this.texto.value.trim(), usuario._id).subscribe({
      next: editado => {
        this.guardando.set(false);
        this.editando.set(false);
        this.actualizado.emit(editado);
      },
      error: error => {
        this.guardando.set(false);
        this.error.set(mensajeDeError(error));
      },
    });
  }
}