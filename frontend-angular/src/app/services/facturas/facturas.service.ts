import { inject, Injectable } from '@angular/core';
import { FacturaResumen } from '../../interfaces/facturas/FacturaResumen';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { appsettings } from '../../settings/appsettings';
import { FacturaRegistro } from '../../interfaces/facturas/FacturaRegistro';
import { FacturaCompleta } from '../../interfaces/facturas/FacturaCompleta';
import { FacturaEvaluacion } from '../../interfaces/facturas/FacturaEvaluacion';

@Injectable({
  providedIn: 'root',
})
export class FacturasService {
  private http = inject(HttpClient);
  private baseUrl = appsettings.apiUrl.endsWith('/')
    ? appsettings.apiUrl
    : appsettings.apiUrl + '/';

  constructor() {}

  listarResumenFacturas(
    idUsuario: number,
    idRol: number,
    codigoUsuarioActual: string,
    idEstados?: number[]
  ): Observable<FacturaResumen[]> {
    let params = new HttpParams()
      .set('idUsuario', idUsuario.toString())
      .set('idRol', idRol.toString())
      .set('codigoUsuarioActual', codigoUsuarioActual);

    if (idEstados && idEstados.length > 0) {
      idEstados.forEach((id) => {
        params = params.append('estados', id.toString());
      });
    }

    console.log('Query Params:', params.toString()); // <--- Verifica aquí la query string

    return this.http
      .get<{ success: boolean; data: FacturaResumen[] }>(
        `${this.baseUrl}Fps_Facturas/ListarResumenFacturas`,
        { params }
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error('Error al cargar resumen de facturas');
        }),
        catchError((error) => {
          console.error('Error en servicio obtenerResumenFacturas:', error);
          return throwError(() => error);
        })
      );
  }

  registrarFactura(
    factura: FacturaRegistro
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<any>(`${this.baseUrl}Fps_Facturas/RegistrarFactura`, factura)
      .pipe(
        catchError((error) => {
          console.error('Error al registrar la factura:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerFacturaDetalle(id: number): Observable<FacturaCompleta> {
    return this.http
      .get<{ isSuccess: boolean; data: FacturaCompleta }>(
        `${this.baseUrl}Fps_Facturas/ObtenerFacturaDetalle/${id}`
      )
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            return response.data;
          } else {
            throw new Error('No se pudo obtener la factura.');
          }
        }),
        catchError((error) => {
          console.error('Error al obtener la factura:', error);
          return throwError(() => new Error('Error al obtener la factura.'));
        })
      );
  }

  actualizarFactura(id: number, factura: FacturaCompleta): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}Fps_Facturas/EditarFactura/${id}`, factura)
      .pipe(
        catchError((error) => {
          console.error('Error actualizando factura:', error);
          return throwError(() => error);
        })
      );
  }

  evaluarFactura(
    evaluacion: FacturaEvaluacion
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .put<{ success: boolean; message: string }>(
        `${this.baseUrl}Fps_Facturas/EvaluarFactura`,
        evaluacion
      )
      .pipe(
        catchError((error) => {
          console.error('Error al evaluar factura:', error);
          let mensaje = 'Ocurrió un error al evaluar la factura.';
          if (error.error?.message) {
            mensaje = error.error.message;
          }
          return throwError(() => new Error(mensaje));
        })
      );
  }
}
