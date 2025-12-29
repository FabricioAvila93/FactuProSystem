import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../settings/appsettings';
import { Agencias } from '../../interfaces/agencias/Agencia';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgenciasService {
  private http = inject(HttpClient);
  private baseUrl = appsettings.apiUrl.endsWith('/')
    ? appsettings.apiUrl
    : appsettings.apiUrl + '/';

  constructor() {}

  cargarAgencias(): Observable<Agencias[]> {
    return this.http
      .get<{ isSuccess: boolean; data: Agencias[] }>(
        `${this.baseUrl}Fps_Agencias/ObtenerAgencias`
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error al obtener agencias:', error);
          return throwError(() => new Error('Error al obtener agencias'));
        })
      );
  }
}
