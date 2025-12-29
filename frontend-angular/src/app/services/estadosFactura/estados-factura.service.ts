import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../settings/appsettings';
import { EstadoFactura } from '../../interfaces/estadoFactura/EstadoFactura';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EstadosFacturaService {
  private http = inject(HttpClient);
  private baseUrl = appsettings.apiUrl.endsWith('/')
    ? appsettings.apiUrl
    : appsettings.apiUrl + '/';

  constructor() {}

  obtenerEstadosFactura(): Observable<EstadoFactura[]> {
    return this.http
      .get<{ success: boolean; data: EstadoFactura[] }>(
        `${this.baseUrl}Fps_EstadoFactura/ObtenerEstadoFactura`
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Error al cargar estados de factura');
        })
      );
  }
}
