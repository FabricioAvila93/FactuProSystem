import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../settings/appsettings';
import { catchError, map, Observable, throwError } from 'rxjs';
import { UsuarioCompleto } from '../../interfaces/usuarios/UsuarioCompleto';
import { UsuarioUpdate } from '../../interfaces/usuarios/UsuarioUpdate';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private baseUrl = appsettings.apiUrl.endsWith('/')
    ? appsettings.apiUrl
    : appsettings.apiUrl + '/';

  constructor() {}

  crearUsuario(objeto: any): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}Fps_Usuarios/CrearUsuario`, objeto)
      .pipe(
        catchError((error) => {
          console.error('Error en servicio:', error);
          return throwError(() => error);
        })
      );
  }

  actualizarUsuario(id: number, usuario: UsuarioUpdate): Observable<any> {
    return this.http
      .put<any>(`${this.baseUrl}Fps_Usuarios/EditarUsuario/${id}`, usuario)
      .pipe(
        catchError((error) => {
          console.error('Error actualizando usuario:', error);
          return throwError(() => error); // Mantener error original
        })
      );
  }

  obtenerUsuarioDetalle(id: number): Observable<UsuarioCompleto> {
    return this.http
      .get<{ isSuccess: boolean; data: UsuarioCompleto }>(
        `${this.baseUrl}Fps_Usuarios/ObtenerUsuarioDetalle/${id}`
      )
      .pipe(
        map((response) => {
          if (response.isSuccess) return response.data;
          throw new Error('No se pudo obtener el usuario.');
        }),
        catchError((error) => {
          console.error('Error al obtener usuario:', error);
          return throwError(() => new Error('Error al obtener usuario'));
        })
      );
  }

  ListarUsuarios(): Observable<UsuarioCompleto[]> {
    return this.http
      .get<{ isSuccess: boolean; data: UsuarioCompleto[] }>(
        `${this.baseUrl}Fps_Usuarios/ListarUsuario`
      )
      .pipe(
        map((response) => {
          if (response.isSuccess) return response.data;
          throw new Error('Error al obtener usuarios');
        }),
        catchError((error) => {
          console.error('Error:', error);
          return throwError(() => new Error('Error al obtener usuarios'));
        })
      );
  }

  resetearClave(idUsuario: number): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}Fps_Usuarios/ResetearClave/${idUsuario}`, {})
      .pipe(
        catchError((error) => {
          console.error('Error al resetear clave:', error);
          return throwError(() => error);
        })
      );
  }
}
