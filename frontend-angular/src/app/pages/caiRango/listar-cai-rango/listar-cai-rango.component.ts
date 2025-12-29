import {
  Component,
  inject,
  ViewChild,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { ProveedorCaiRangoService } from '../../../services/proveedorCaiRango/proveedor-cai-rango.service';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import { ProveedorCaiRango } from '../../../interfaces/proveedorCaiRango/ProveedorCaiRango';
import { RegistrarCaiRangoComponent } from '../registrar-cai-rango/registrar-cai-rango.component';
import { DetalleCaiRangoComponent } from '../detalle-cai-rango/detalle-cai-rango.component';

@Component({
  selector: 'app-listar-cai-rango',
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
  templateUrl: './listar-cai-rango.component.html',
  styleUrl: './listar-cai-rango.component.css',
})
export class ListarCaiRangoComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<ProveedorCaiRango>([]);
  displayedColumns = [
    'idRangoCAI',
    'CAI',
    'documentoFiscal_Inicio',
    'documentoFiscal_Fin',
    'fechaExpiracion',
    'activo',
    'acciones',
  ];

  cargando = false;
  error = '';
  idProveedor: number | null = null;
  nombreProveedor: string = '';

  proveedorRangoCaiService = inject(ProveedorCaiRangoService);
  router = inject(Router);
  dialog = inject(MatDialog);
  private notificacionService = inject(NotificacionService);
  activatedRoute = inject(ActivatedRoute);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = valor;
  }

  cargarProveedorCaiRango(): void {
    if (!this.idProveedor) {
      this.error = 'ID de proveedor no válido.';
      return;
    }

    this.cargando = true;

    this.proveedorRangoCaiService
      .listarPorProveedor(this.idProveedor)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.rangos;
          this.nombreProveedor = response.nombreProveedor; // Solo si lo usas
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar rangos de CAI:', err);
          this.error =
            'No se pudo obtener la lista de rangos de CAI del proveedor.';
          this.cargando = false;
        },
      });
  }

  abrirFormularioNuevoRangoCai(): void {
    const dialogRef = this.dialog.open(RegistrarCaiRangoComponent, {
      width: '700px',
      disableClose: false,
      hasBackdrop: true,
      data: { idProveedor: this.idProveedor },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'guardado') {
        this.cargarProveedorCaiRango();
      }
    });
  }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('idProveedor');
    this.idProveedor = id ? +id : null;

    if (this.idProveedor) {
      this.cargarDatosProveedorConRangos(this.idProveedor);
    }
  }

  cargarDatosProveedorConRangos(idProveedor: number): void {
    this.cargando = true;
    this.error = '';
    this.nombreProveedor = '';

    this.proveedorRangoCaiService
      .listarConNombrePorProveedor(idProveedor)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.nombreProveedor = res.nombreProveedor;
            this.dataSource.data = res.rangos;
            this.error = '';
          } else {
            this.error = '';
            this.nombreProveedor = 'Proveedor desconocido';
          }

          this.cargando = false;
        },
        error: (err) => {
          console.error('Error cargando datos del proveedor:', err);

          if (
            err.status === 404 &&
            err.error?.message?.includes('Proveedor no encontrado')
          ) {
            this.nombreProveedor = 'Proveedor desconocido';
            this.error = '';
          } else {
            this.error = 'Error al cargar los datos.';
            this.nombreProveedor = 'Proveedor desconocido';
          }

          this.dataSource.data = [];
          this.cargando = false;
        },
      });
  }

  abrirFormularioVerRangoCai(idRangoCAI: number): void {
    this.dialog.open(DetalleCaiRangoComponent, {
      width: '600px',
      data: { idRangoCAI, modo: 'ver' },
      hasBackdrop: true,
      disableClose: false,
    });
  }

  abrirFormularioEditarVerRangoCai(idRangoCAI: number): void {
    const dialogRef = this.dialog.open(DetalleCaiRangoComponent, {
      width: '600px',
      data: { idRangoCAI, modo: 'editar' },
      hasBackdrop: true,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'actualizado') {
        this.cargarProveedorCaiRango();
      }
    });
  }
}
