import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../settings/appsettings';
import { ProveedorCaiRango } from '../../interfaces/proveedorCaiRango/ProveedorCaiRango';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ProveedorCaiRangoUpdate } from '../../interfaces/proveedorCaiRango/ProveedorCaiRangoUpdate';

@Injectable({
  providedIn: 'root',
})
export class ProveedorCaiRangoService {
  private http = inject(HttpClient);
  private baseUrl = appsettings.apiUrl.endsWith('/')
    ? appsettings.apiUrl
    : appsettings.apiUrl + '/';

  constructor() {}

  listarPorProveedor(
    idProveedor: number
  ): Observable<{
    success: boolean;
    nombreProveedor: string;
    rangos: ProveedorCaiRango[];
  }> {
    return this.http
      .get<{
        success: boolean;
        nombreProveedor: string;
        rangos: ProveedorCaiRango[];
      }>(
        `${this.baseUrl}Fps_ProveedorCaiRango/ListarPorProveedor/${idProveedor}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error listando rangos de CAI por proveedor:', error);
          return throwError(() => error);
        })
      );
  }

  crearCaiRango(dto: ProveedorCaiRango): Observable<any> {
    return this.http
      .post(`${this.baseUrl}Fps_ProveedorCaiRango/RegistrarRangoCai`, dto)
      .pipe(
        catchError((error) => {
          console.error('Error creando rango de CAI:', error);
          return throwError(() => error);
        })
      );
  }

  listarConNombrePorProveedor(
    idProveedor: number
  ): Observable<{
    success: boolean;
    nombreProveedor: string;
    rangos: ProveedorCaiRango[];
  }> {
    return this.http
      .get<{
        success: boolean;
        nombreProveedor: string;
        rangos: ProveedorCaiRango[];
      }>(
        `${this.baseUrl}Fps_ProveedorCaiRango/ListarConNombrePorProveedor/${idProveedor}`
      )
      .pipe(
        catchError((error) => {
          console.error('Error listando rangos y nombre del proveedor:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerRangoCaiDetalle(idRangoCai: number): Observable<ProveedorCaiRango> {
    return this.http
      .get<{ isSuccess: boolean; data: ProveedorCaiRango }>(
        `${this.baseUrl}Fps_ProveedorCaiRango/ObtenerRangoCaiDetalle/${idRangoCai}`
      )
      .pipe(
        map((response) => {
          if (response.isSuccess) return response.data;
          throw new Error('No se pudo obtener el rango CAI.');
        }),
        catchError((error) => {
          console.error('Error al obtener el rango CAI:', error);
          return throwError(() => new Error('Error al obtener el rango CAI'));
        })
      );
  }

  actualizarRangoCai(
    id: number,
    dto: ProveedorCaiRangoUpdate
  ): Observable<any> {
    return this.http
      .put(`${this.baseUrl}Fps_ProveedorCaiRango/EditarRangoCai/${id}`, dto)
      .pipe(
        catchError((error) => {
          console.error('Error actualizando rango de CAI:', error);
          return throwError(() => error);
        })
      );
  }

  validarDocumento(
    idProveedor: number,
    documento: string,
    idFactura?: number
  ): Observable<any> {
    let url = `${this.baseUrl}Fps_ProveedorCaiRango/ValidarDocumentoCompleto/${idProveedor}/${documento}`;
    if (idFactura) url += `/${idFactura}`;
    return this.http
      .get(url)
      .pipe(
        catchError((error) =>
          throwError(() => new Error('Error al validar documento fiscal'))
        )
      );
  }
}
