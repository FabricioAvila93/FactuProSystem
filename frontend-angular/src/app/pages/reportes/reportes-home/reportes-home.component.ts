import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reportes-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reportes-home.component.html',
  styleUrls: ['./reportes-home.component.css'],
})
export class ReportesHomeComponent {
  reportes = [
    { nombre: 'DETALLE GENERAL DE FACTURAS', ruta: '/reportes/facturas' },
  ];
}
