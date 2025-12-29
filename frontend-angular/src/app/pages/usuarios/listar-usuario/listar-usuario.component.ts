import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { UsuarioCompleto } from '../../../interfaces/usuarios/UsuarioCompleto';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { HttpClientModule } from '@angular/common/http';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RegistrarUsuarioComponent } from '../registrar-usuario/registrar-usuario.component';
import { DetalleUsuariosComponent } from '../detalle-usuarios/detalle-usuarios.component';
import { NotificacionService } from '../../../services/ui/notificacion.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    HttpClientModule,
    MatFormField,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],

  selector: 'app-listar-usuario',
  templateUrl: './listar-usuario.component.html',
  styleUrls: ['./listar-usuario.component.css'],
})
export class ListarUsuarioComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<UsuarioCompleto>([]);
  displayedColumns = [
    'idUsuario',
    'codigoUsuario',
    'nombreCompleto',
    'identificacion',
    'rol',
    'agencia',
    'activo',
    'acciones',
  ];
  cargando = false;
  error = '';
  idUsuario: number | null = null;

  private notificacionService = inject(NotificacionService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usuarioService: UsuariosService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  aplicarFiltro(event: Event) {
    const filtroValor = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filtroValor;
  }

  cargarUsuarios() {
    this.cargando = true;
    this.usuarioService.ListarUsuarios().subscribe({
      next: (usuarios) => {
        this.dataSource.data = usuarios;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error = 'No se pudo obtener la lista de usuarios';
        this.cargando = false;
      },
    });
  }

  abrirFormularioNuevoUsuario(): void {
    const dialogRef = this.dialog.open(RegistrarUsuarioComponent, {
      width: '600px',
      disableClose: false,
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'guardado') {
        this.cargarUsuarios();
      }
    });
  }

  abrirFormularioEditarUsuario(idUsuario: number): void {
    const dialogRef = this.dialog.open(DetalleUsuariosComponent, {
      width: '600px',
      data: { idUsuario, modo: 'editar' },
      hasBackdrop: true,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'actualizado') {
        this.cargarUsuarios();
      }
    });
  }

  abrirFormularioVerUsuario(idUsuario: number): void {
    this.dialog.open(DetalleUsuariosComponent, {
      width: '600px',
      data: { idUsuario, modo: 'ver' },
      hasBackdrop: true,
      disableClose: false,
    });
  }

  resetearClave(idUsuario: number, codigoUsuario: string): void {
    if (!idUsuario) {
      this.notificacionService.mostrarMensajeError(
        'Error',
        'ID de usuario no válido.'
      );
      return;
    }

    // Concatenar el código de usuario en el mensaje
    const mensaje = `¿Estás seguro que deseas reestablecer la contraseña del usuario "${codigoUsuario}"?`;

    this.notificacionService
      .confirmar('Confirmar acción', mensaje)
      .subscribe((confirmado) => {
        if (confirmado) {
          this.usuarioService.resetearClave(idUsuario).subscribe({
            next: () => {
              this.notificacionService.mostrarMensajeExito(
                'Éxito',
                `La contraseña del usuario "${codigoUsuario}" ha sido reestablecida correctamente.`
              );
            },
            error: (error) => {
              const mensajeError =
                error?.error?.message || 'Error al reestablecer la contraseña.';
              this.notificacionService.mostrarMensajeError(
                'Error',
                mensajeError
              );
            },
          });
        }
      });
  }
}
