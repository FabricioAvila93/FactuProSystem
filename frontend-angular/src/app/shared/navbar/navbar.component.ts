import { Component, OnInit } from '@angular/core';
import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  nombreUsuario: string | null = '';

  ngOnInit() {
    const nombre = sessionStorage.getItem('nombreUsuario');
    this.nombreUsuario = nombre ? nombre.toUpperCase() : '';
  }
}
