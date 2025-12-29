import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FacturasService } from '../../../services/facturas/facturas.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import { FacturaResumen } from '../../../interfaces/facturas/FacturaResumen';
import { EstadosFacturaService } from '../../../services/estadosFactura/estados-factura.service';
import { EstadoFactura } from '../../../interfaces/estadoFactura/EstadoFactura';
import { RegistroFacturaComponent } from '../registro-factura/registro-factura.component';
import { DetalleFacturaComponent } from '../detalle-factura/detalle-factura.component';

@Component({
  selector: 'app-listar-resumen-facturas',
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
  templateUrl: './listar-resumen-facturas.component.html',
  styleUrl: './listar-resumen-facturas.component.css',
})
export class ListarResumenFacturasComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<FacturaResumen>([]);
  displayedColumns = [
    'idFactura',
    'nombreProveedor',
    'rtnProveedor',
    'fecha',
    'codigoUsuario',
    'acciones',
  ];

  estados: EstadoFactura[] = [];
  estadoSeleccionado: number[] = [];
  cargando = false;
  error = '';
  usuarioLogueado: string = '';
  estadoAprobado = 10;

  facturaService = inject(FacturasService);
  router = inject(Router);
  dialog = inject(MatDialog);
  private notificacionService = inject(NotificacionService);
  private estadosFacturaService = inject(EstadosFacturaService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.usuarioLogueado = sessionStorage.getItem('codigoUsuario') || '';
    this.cargarResumenFacturas();
    this.cargarEstados();

    this.dataSource.filterPredicate = (
      data: FacturaResumen,
      filter: string
    ) => {
      const filtro = filter.trim().toLowerCase();
      const nombre = data.nombreProveedor.toLowerCase();
      const rtn = (data as any).rtnProveedor?.toLowerCase() ?? '';
      return nombre.includes(filtro) || rtn.includes(filtro);
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarResumenFacturas(): void {
    const idUsuario = Number(sessionStorage.getItem('idUsuario'));
    const idRol = Number(sessionStorage.getItem('idRol'));
    const codigoUsuarioActual = sessionStorage.getItem('codigoUsuario') ?? '';

    this.facturaService
      .listarResumenFacturas(idUsuario, idRol, codigoUsuarioActual)
      .subscribe({
        next: (data) => {
          this.dataSource.data = data;
        },
        error: (err) => {
          console.error('Error al cargar facturas:', err);
        },
      });
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  cargarEstados(): void {
    this.estadosFacturaService.obtenerEstadosFactura().subscribe({
      next: (data) => {
        this.estados = data;
      },
      error: (err) => {
        console.error('Error al cargar estados:', err);
      },
    });
  }

  abrirFormularioNuevaFactura(): void {
    const dialogRef = this.dialog.open(RegistroFacturaComponent, {
      width: '600px',
      disableClose: false,
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'guardado') {
        this.cargarResumenFacturas();
      }
    });
  }

  abrirFormularioVerFactura(idFactura: number): void {
    this.dialog.open(DetalleFacturaComponent, {
      width: '600px',
      data: { idFactura, modo: 'ver' },
      hasBackdrop: true,
      disableClose: false,
    });
  }

  abrirFormularioEditarFactura(idFactura: number): void {
    const dialogRef = this.dialog.open(DetalleFacturaComponent, {
      width: '600px',
      data: { idFactura, modo: 'editar' },
      hasBackdrop: true,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'actualizado') {
        this.cargarResumenFacturas();
      }
    });
  }
}
