import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FondoRuta } from './components/fondo-ruta/fondo-ruta';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FondoRuta],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}