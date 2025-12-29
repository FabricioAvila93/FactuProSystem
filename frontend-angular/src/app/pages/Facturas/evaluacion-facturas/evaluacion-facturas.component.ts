import { Component, inject, ViewChild } from '@angular/core';
import { FacturaResumen } from '../../../interfaces/facturas/FacturaResumen';
import { EstadoFactura } from '../../../interfaces/estadoFactura/EstadoFactura';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FacturasService } from '../../../services/facturas/facturas.service';
import { EstadosFacturaService } from '../../../services/estadosFactura/estados-factura.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { DetalleFacturaComponent } from '../detalle-factura/detalle-factura.component';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TemplateRef } from '@angular/core';
import { FacturaEvaluacion } from '../../../interfaces/facturas/FacturaEvaluacion';

@Component({
  selector: 'app-evaluacion-facturas',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormField,
    MatLabel,
    MatPaginator,
    MatPaginatorModule,
    MatSortModule,
  ],
  templateUrl: './evaluacion-facturas.component.html',
  styleUrls: ['./evaluacion-facturas.component.css'],
})
export class EvaluacionFacturasComponent {
  facturas: FacturaResumen[] = [];
  estados: EstadoFactura[] = [];
  cargando = false;
  error = '';
  dialogRefComentario: any;

  displayedColumns = [
    'idFactura',
    'nombreProveedor',
    'fecha',
    'codigoUsuario',
    'estado',
    'comentarioAdmin',
    'acciones',
  ];

  dataSource = new MatTableDataSource<FacturaResumen>([]);
  facturaSeleccionada: FacturaResumen | null = null;
  rechazoAbierto: boolean = false;
  comentarioRechazo: string = '';
  comentarioAprobacion: string = '';
  aprobacionAbierta: boolean = false;

  idRol: number = 0;

  private facturasService = inject(FacturasService);
  private estadoService = inject(EstadosFacturaService);

  router = inject(Router);
  dialog = inject(MatDialog);
  private notificacionService = inject(NotificacionService);
  activatedRoute = inject(ActivatedRoute);
  facturaService = inject(FacturasService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogComentario') dialogComentario!: TemplateRef<any>;
  @ViewChild('dialogComentario') dialogObservaciones!: TemplateRef<any>;

  ngOnInit(): void {
    const idUsuario = Number(sessionStorage.getItem('idUsuario'));
    this.idRol = Number(sessionStorage.getItem('idRol'));
    const codigoUsuario = sessionStorage.getItem('codigoUsuario') ?? '';

    this.cargarEstados();
    this.cargarFacturas(idUsuario, this.idRol, codigoUsuario);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarEstados(): void {
    this.estadoService.obtenerEstadosFactura().subscribe({
      next: (data) => (this.estados = data),
      error: (err) => console.error('Error cargando estados', err),
    });
  }

  cargarFacturas(
    idUsuario: number,
    idRol: number,
    codigoUsuario: string
  ): void {
    this.facturasService
      .listarResumenFacturas(idUsuario, idRol, codigoUsuario)
      .subscribe({
        next: (data) => {
          console.log('Facturas recibidas:', data);
          this.facturas = data;
          this.dataSource.data = data;
        },
        error: (error) => console.error('Error al cargar facturas', error),
      });
  }

  obtenerNombreEstado(idEstado: number): string {
    const estado = this.estados.find((e) => e.idEstado === idEstado);
    return estado ? estado.nombreEstado : 'Desconocido';
  }

  verFactura(idFactura: number): void {
    const dialogRef = this.dialog.open(DetalleFacturaComponent, {
      width: '600px',
      disableClose: true,
      data: { idFactura, modo: 'ver' },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  abrirFormularioEditarFactura(factura: FacturaResumen): void {
    const dialogRef = this.dialog.open(DetalleFacturaComponent, {
      width: '600px',
      data: { idFactura: factura.idFactura, modo: 'editar' }, // ✅ solo el ID
      hasBackdrop: true,
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'actualizado') {
        this.cargarResumenFacturas(); // recarga la tabla
      }
    });
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

  abrirAprobacion(factura: FacturaResumen): void {
    this.facturaSeleccionada = factura;
    this.comentarioAprobacion = '';
    this.aprobacionAbierta = true;
  }

  cancelarAprobacion(): void {
    this.aprobacionAbierta = false;
    this.facturaSeleccionada = null;
    this.comentarioAprobacion = '';
  }

  confirmarAprobacion(): void {
    if (!this.facturaSeleccionada) return;

    const mensaje = `¿Está seguro que desea APROBAR la factura ID ${this.facturaSeleccionada.idFactura} del proveedor ${this.facturaSeleccionada.nombreProveedor}?`;

    this.notificacionService
      .confirmar('Confirmar Aprobacion', mensaje)
      .subscribe((confirmado: boolean) => {
        if (confirmado && this.facturaSeleccionada) {
          this.guardarEvaluacion(
            this.facturaSeleccionada.idFactura,
            10,
            this.comentarioAprobacion.trim()
          );
          this.aprobacionAbierta = false;
          this.notificacionService.mostrarMensajeExito(
            'Factura aprobada',
            `Factura ID ${this.facturaSeleccionada.idFactura} aprobada correctamente.`
          );
        }
      });
  }

  abrirRechazo(factura: FacturaResumen): void {
    this.facturaSeleccionada = factura;
    this.comentarioRechazo = '';
    this.rechazoAbierto = true;
  }

  cancelarRechazo(): void {
    this.rechazoAbierto = false;
    this.facturaSeleccionada = null;
    this.comentarioRechazo = '';
  }

  confirmarRechazo(): void {
    if (!this.comentarioRechazo.trim()) {
      this.notificacionService.mostrarMensajeError(
        'Debe ingresar un comentario para rechazar la factura.'
      );
      return;
    }

    if (!this.facturaSeleccionada) return;

    const mensaje = `¿Está seguro que desea RECHAZAR la factura ID ${this.facturaSeleccionada.idFactura} del proveedor ${this.facturaSeleccionada.nombreProveedor}?`;

    this.notificacionService
      .confirmar('Confirmar rechazo', mensaje)
      .subscribe((confirmado: boolean) => {
        if (confirmado && this.facturaSeleccionada) {
          this.guardarEvaluacion(
            this.facturaSeleccionada.idFactura,
            11,
            this.comentarioRechazo.trim()
          );
          this.rechazoAbierto = false;
          this.notificacionService.mostrarMensajeExito(
            'Factura rechazada',
            `Factura ID ${this.facturaSeleccionada.idFactura} rechazada correctamente.`
          );
        }
      });
  }

  private guardarEvaluacion(
    idFactura: number,
    idEstado: number,
    comentario?: string
  ): void {
    const evaluacion: any = {
      idFactura,
      idEstado,
      codigoUsuario: sessionStorage.getItem('codigoUsuario'),
      fechaEvaluacion: new Date().toISOString(),
    };

    // Comentario opcional para aprobaciones
    if (idEstado === 10) {
      evaluacion.fechaContable = new Date().toISOString();
      evaluacion.comentarioAdmin =
        comentario?.trim() || 'Factura aprobada sin observaciones';
    } else if (idEstado === 11) {
      evaluacion.comentarioAdmin = comentario?.trim();
    }

    console.log('Payload que se envía al backend:', evaluacion);

    this.facturasService.evaluarFactura(evaluacion).subscribe({
      next: () => {
        const factura = this.facturas.find((f) => f.idFactura === idFactura);
        if (factura) {
          factura.idEstado = idEstado;
          factura.comentarioAdmin = evaluacion.comentarioAdmin;
        }
        this.facturaSeleccionada = null;
        this.comentarioRechazo = '';
        this.comentarioAprobacion = '';
        this.notificacionService.mostrarMensajeExito(
          'Evaluación guardada',
          `Factura ID ${idFactura} evaluada correctamente.`
        );
      },
      error: (error) => {
        console.error('Error al evaluar factura', error);
        this.notificacionService.mostrarMensajeError(
          'Ocurrió un error al evaluar la factura.'
        );
      },
    });
  }

  aplicarFiltro(event: Event) {
    const filtroValor = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filtroValor;
  }

  abrirComentario(comentario: string) {
    this.dialogRefComentario = this.dialog.open(this.dialogComentario, {
      width: '400px',
      data: { comentario },
    });
  }

  cerrarDialog() {
    if (this.dialogRefComentario) {
      this.dialogRefComentario.close();
    }
  }

  abrirObservaciones(observaciones: string) {
    this.dialogRefComentario = this.dialog.open(this.dialogObservaciones, {
      width: '400px',
      data: { observaciones },
    });
  }
}
