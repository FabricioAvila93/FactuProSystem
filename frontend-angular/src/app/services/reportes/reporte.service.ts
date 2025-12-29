import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private reportServerUrl =
    'http://localhost/ReportServer?/FacturasReports/FacturasReport';

  constructor() {}

  /**
   * Abre el reporte en nueva pestaña.
   * @param fechaInicio dd/MM/yyyy
   * @param fechaFin dd/MM/yyyy
   * @param formato PDF o EXCEL
   */
  abrirReporte(
    fechaInicio?: string,
    fechaFin?: string,
    formato: string = 'PDF'
  ): void {
    if (!fechaInicio || !fechaFin) {
      alert('Debe seleccionar fecha de inicio y fin.');
      return;
    }

    // Convertir dd/MM/yyyy -> yyyy-MM-dd
    const inicioISO = fechaInicio.includes('/')
      ? fechaInicio.split('/').reverse().join('-')
      : fechaInicio;
    const finISO = fechaFin.includes('/')
      ? fechaFin.split('/').reverse().join('-')
      : fechaFin;

    const url =
      `${this.reportServerUrl}` +
      `&rs:Embed=true&rc:Toolbar=true&rc:Format=${formato}` +
      `&FechaInicio=${inicioISO}&FechaFin=${finISO}`;

    window.open(url, '_blank');
  }
}
