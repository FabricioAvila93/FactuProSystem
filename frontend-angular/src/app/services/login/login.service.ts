import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { appsettings } from '../../settings/appsettings';
import { Observable } from 'rxjs';
import { LoginResponse } from '../../interfaces/login/LoginResponse';
import { Login } from '../../interfaces/login/Login';
import { CambioClave } from '../../interfaces/login/CambioClave';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor() {}

  private http = inject(HttpClient);
  private baseUrl: string = appsettings.apiUrl;

  login(objeto: Login): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}Fps_Login/Login`,
      objeto
    );
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  cambiarClave(datos: CambioClave): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}Fps_Login/CambiarClavePrimerIngreso`,
      datos
    );
  }
}
