import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = sessionStorage.getItem('token');
    const tiempoExpira = sessionStorage.getItem('expira');
    const ahora = Date.now();

    if (!token || !tiempoExpira || ahora - parseInt(tiempoExpira) >= 3600000) {
      sessionStorage.clear();
      this.router.navigate(['/login']);
      return false;
    }

    const idRol = Number(sessionStorage.getItem('idRol'));
    const rolesPermitidos: number[] = route.data['roles'];

    if (rolesPermitidos && !rolesPermitidos.includes(idRol)) {
      // No tiene permiso para esta ruta
      alert('No tienes permiso para acceder a esta página.');
      this.router.navigate(['/home']); // o a una página de acceso denegado
      return false;
    }

    return true;
  }
}
