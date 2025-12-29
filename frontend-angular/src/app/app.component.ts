/*import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'factu-pro-system';
  mostrarNavbar = true;
  mostrarSidebar = true;

  private router = inject(Router); // <--- Aquí usamos inject

  constructor() {
    // Control de navbar y sidebar según la ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const ruta = event.urlAfterRedirects;
      const rutasOcultas = ['/login', '/reseteo-contrasena'];
      const esRutaOculta = rutasOcultas.some(r => ruta.includes(r));

      this.mostrarNavbar = !esRutaOculta;
      this.mostrarSidebar = !esRutaOculta;
    });

    // Evitar que el usuario use la flecha atrás sin estar logueado
    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login'], { replaceUrl: true });
        history.pushState(null, '', '/login');
      } else {
        window.location.reload();
      }
    });
  }
}
*/

import { Component, inject, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { NgIf } from '@angular/common';
import { fromEvent, merge, timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'factu-pro-system';
  mostrarNavbar = true;
  mostrarSidebar = true;

  private router = inject(Router);
  private suscripcionInactividad!: Subscription;
  private TIEMPO_INACTIVO = 5 * 60 * 1000;

  constructor() {
    // Control de navbar y sidebar según la ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const ruta = event.urlAfterRedirects;
      const rutasOcultas = ['/login', '/reseteo-contrasena'];
      const esRutaOculta = rutasOcultas.some(r => ruta.includes(r));

      this.mostrarNavbar = !esRutaOculta;
      this.mostrarSidebar = !esRutaOculta;
    });

    // Evitar que el usuario use la flecha atrás sin estar logueado
    history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        this.router.navigate(['/login'], { replaceUrl: true });
        history.pushState(null, '', '/login');
      } else {
        window.location.reload();
      }
    });

    // Iniciar seguimiento de inactividad
    this.iniciarSeguimientoInactividad();
  }

  private iniciarSeguimientoInactividad() {
    const eventosUsuario$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'click'),
      fromEvent(document, 'scroll')
    );

    this.suscripcionInactividad = eventosUsuario$
      .pipe(switchMap(() => timer(this.TIEMPO_INACTIVO)))
      .subscribe(() => {
        this.logoutPorInactividad();
      });
  }

  private logoutPorInactividad() {
    alert('Se ha cerrado sesión por inactividad.');
    sessionStorage.removeItem('token');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  ngOnDestroy() {
    if (this.suscripcionInactividad) {
      this.suscripcionInactividad.unsubscribe();
    }
  }
}

