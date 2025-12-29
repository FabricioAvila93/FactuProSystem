import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [RouterOutlet, RouterModule, CommonModule],
})
export class SidebarComponent implements OnInit {
  idRol: number = 0;

  ngOnInit() {
    const rolStr = sessionStorage.getItem('idRol');
    this.idRol = rolStr ? Number(rolStr) : 0;
    console.log('Rol en Sidebar:', this.idRol); // para debug
  }

  tieneAcceso(rolesPermitidos: number[]): boolean {
    return rolesPermitidos.includes(this.idRol);
  }

  cerrarSesion() {
    sessionStorage.clear();
    window.location.href = '/login';
  }
}
