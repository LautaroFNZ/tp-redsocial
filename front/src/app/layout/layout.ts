import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Patente } from '../shared/patente/patente';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Patente],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}