import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../settings/appsettings';
import { TipoDocumentoFactura } from '../../interfaces/documentoFactura/TipoDocumentoFactura';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TipoDocumentoFacturaService {
  private http = inject(HttpClient);
  private baseUrl = appsettings.apiUrl.endsWith('/')
    ? appsettings.apiUrl
    : appsettings.apiUrl + '/';

  constructor() {}

  obtenerTipoDocumentoFactura(): Observable<TipoDocumentoFactura[]> {
    return this.http
      .get<{ isSuccess: boolean; data: TipoDocumentoFactura[] }>(
        `${this.baseUrl}Fps_TipoDocumentoFactura/ObtenerTipoDocumentoFactura`
      )
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            return response.data;
          }
          throw new Error('Error al cargar documentos');
        }),
        catchError((error: any) => {
          console.error('Error al obtener documentos:', error);
          return throwError(() => new Error('Error al obtener documentos'));
        })
      );
  }
}
