import {
  Component,
  OnInit,
  AfterViewInit,
  inject,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ProveedorCompleto } from '../../../interfaces/proveedor/ProveedorCompleto';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClientModule } from '@angular/common/http';
import { ProveedorService } from '../../../services/proveedor/proveedor.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RegistrarProveedorComponent } from '../registrar-proveedor/registrar-proveedor.component';
import { DetalleProveedorComponent } from '../detalle-proveedor/detalle-proveedor.component';

@Component({
  selector: 'app-listar-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './listar-proveedor.component.html',
  styleUrl: './listar-proveedor.component.css',
})
export class ListarProveedorComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<ProveedorCompleto>([]);
  displayedColumns = ['idProveedor', 'RTN', 'Proveedor', 'Activo', 'Acciones'];
  cargando = false;
  error = '';

  proveedorService = inject(ProveedorService);
  router = inject(Router);
  dialog = inject(MatDialog);
  private notificacionService = inject(NotificacionService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.cargarProveedores();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarProveedores(): void {
    this.cargando = true;
    this.proveedorService.listarProveedores().subscribe({
      next: (proveedores) => {
        this.dataSource.data = proveedores;
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
        this.error = 'No se pudo cargar la lista de proveedores.';
        this.notificacionService.mostrarMensajeError('Error', this.error);
      },
    });
  }

  aplicarFiltro(event: Event) {
    const filtroValor = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filtroValor;
  }

  abrirFormularioNuevoProveedor(): void {
    const dialogRef = this.dialog.open(RegistrarProveedorComponent, {
      width: '600px',
      disableClose: false,
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'guardado') {
        this.cargarProveedores();
      }
    });
  }

  abrirFormularioVerProveedor(idProveedor: number): void {
    this.dialog.open(DetalleProveedorComponent, {
      width: '600px',
      data: { idProveedor, modo: 'ver' },
      hasBackdrop: true,
      disableClose: false,
    });
  }

  abrirFormularioEditarProveedor(idProveedor: number): void {
    const dialogRef = this.dialog.open(DetalleProveedorComponent, {
      width: '600px',
      data: { idProveedor, modo: 'editar' },
      hasBackdrop: true,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'actualizado') {
        this.cargarProveedores();
      }
    });
  }

  abrirListaRangoCaiPorProveedor(idProveedor: number): void {
    this.router.navigate(['proveedorCaiRango/listar', idProveedor]);
  }
}
