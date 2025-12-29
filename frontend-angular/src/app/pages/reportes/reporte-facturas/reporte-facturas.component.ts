import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from '../../../pipes/safe.pipe';

@Component({
  selector: 'app-reporte-facturas',
  standalone: true,
  imports: [CommonModule, SafePipe],
  templateUrl: './reporte-facturas.component.html',
  styleUrls: ['./reporte-facturas.component.css'],
})
export class ReporteFacturasComponent {
  urlReporte: string;

  constructor() {
    const serverUrl = 'http://localhost/ReportServer';
    const reportPath = '/FacturasReports/FacturasReport';

    this.urlReporte = `${serverUrl}?${reportPath}&rs:Embed=true`;
  }
}
