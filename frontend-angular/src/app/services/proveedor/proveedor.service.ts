import { inject, Injectable } from '@angular/core';
import { ProveedorCompleto } from '../../interfaces/proveedor/ProveedorCompleto';
import { HttpClient } from '@angular/common/http';
import { appsettings } from '../../settings/appsettings';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ProveedorUpdate } from '../../interfaces/proveedor/ProveedorUpdate';

@Injectable({
  providedIn: 'root',
})
export class ProveedorService {
  private http = inject(HttpClient);
  private baseUrl = appsettings.apiUrl.endsWith('/')
    ? appsettings.apiUrl
    : appsettings.apiUrl + '/';

  constructor() {}

  crearProveedor(objeto: any): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}Fps_Proveedor/RegistrarProveedor`, objeto)
      .pipe(
        catchError((error) => {
          console.error('Error en servicio:', error);
          return throwError(() => error);
        })
      );
  }

  actualizarProveedor(id: number, proveedor: ProveedorUpdate): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}Fps_Proveedor/EditarProveedor/${id}`, proveedor)
      .pipe(
        catchError((error) => {
          console.error('Error actualizando usuario:', error);
          return throwError(() => error);
        })
      );
  }

  obtenerProveedorDetalle(id: number): Observable<ProveedorCompleto> {
    return this.http
      .get<{ isSuccess: boolean; data: ProveedorCompleto }>(
        `${this.baseUrl}Fps_Proveedor/ObtenerProveedorDetalle/${id}`
      )
      .pipe(
        map((response) => {
          if (response.isSuccess) return response.data;
          throw new Error('No se pudo obtener el proveedor.');
        }),
        catchError((error) => {
          console.error('Error al obtener usuario:', error);
          return throwError(() => new Error('Error al obtener proveedor'));
        })
      );
  }

  listarProveedores(): Observable<ProveedorCompleto[]> {
    return this.http
      .get<{ isSuccess: boolean; data: ProveedorCompleto[] }>(
        `${this.baseUrl}Fps_Proveedor/ListarProveedores`
      )
      .pipe(
        map((response) => {
          if (response.isSuccess) return response.data;
          throw new Error('Error al listar Proveedores');
        }),
        catchError((error) => {
          console.error('Error:', error);
          return throwError(() => new Error('Error al listar Proveedores'));
        })
      );
  }
}
