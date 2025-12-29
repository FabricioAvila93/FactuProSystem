import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../settings/appsettings';
import { map, Observable } from 'rxjs';
import { Roles } from '../../interfaces/roles/Roles';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor() {}

  private http = inject(HttpClient);
  private baseUrl = appsettings.apiUrl.endsWith('/')
    ? appsettings.apiUrl
    : appsettings.apiUrl + '/';

  cargarRoles(): Observable<Roles[]> {
    return this.http
      .get<{ isSuccess: boolean; data: Roles[] }>(
        `${this.baseUrl}Fps_Roles/ObtenerRol`
      )
      .pipe(
        map((response) => {
          if (response.isSuccess) return response.data;
          throw new Error('Error al obtener roles');
        })
      );
  }
}
