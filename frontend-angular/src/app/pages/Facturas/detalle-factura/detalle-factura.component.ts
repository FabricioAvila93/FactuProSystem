import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TipoDocumentoFacturaService } from '../../../services/tipoDocumentoFactura/tipo-documento-factura.service';

import { NotificacionService } from '../../../services/ui/notificacion.service';
import { FacturasService } from '../../../services/facturas/facturas.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MY_DATE_FORMATS } from '../../../shared/calendar/date-format';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { TipoDocumentoFactura } from '../../../interfaces/documentoFactura/TipoDocumentoFactura';
import { FacturaCompleta } from '../../../interfaces/facturas/FacturaCompleta';
import { ProveedorCargaCombo } from '../../../interfaces/proveedor/ProveedorCargaCombo';
import { map, Observable, startWith } from 'rxjs';
import { ProveedorService } from '../../../services/proveedor/proveedor.service';
import { ProveedorCaiRangoService } from '../../../services/proveedorCaiRango/proveedor-cai-rango.service';

@Component({
  selector: 'app-detalle-factura',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatSelectModule,
    MatAutocompleteModule,
    FormsModule,
    MatIconModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
  ],
  templateUrl: './detalle-factura.component.html',
  styleUrl: './detalle-factura.component.css',
})
export class DetalleFacturaComponent {
  formDetalleFactura!: FormGroup;
  idFactura: number | null = null;
  modo: 'ver' | 'editar' = 'ver';
  esNuevo: boolean = true;
  estadoActivoOriginal: boolean = false;
  error: string = '';
  cargando: boolean = false;
  tipoDocumentoFactura: TipoDocumentoFactura[] = [];
  proveedorControl = new FormControl('');
  modoSoloLectura = false;
  proveedoresFiltrados!: Observable<ProveedorCargaCombo[]>;
  proveedores: ProveedorCargaCombo[] = [];
  private longitudesCai = [6, 6, 6, 6, 6, 2];
  idFacturaActual?: number;

  private fb = inject(FormBuilder);
  private facturaService = inject(FacturasService);
  private dialogRef = inject(MatDialogRef<DetalleFacturaComponent>);
  private data = inject(MAT_DIALOG_DATA) as {
    idFactura: number;
    modo: 'ver' | 'editar';
  };
  private notificacionService = inject(NotificacionService);
  private tipoDocumentoService = inject(TipoDocumentoFacturaService);
  private proveedorService = inject(ProveedorService);
  private caiProveedorService = inject(ProveedorCaiRangoService);

  onProveedorSeleccionado(nombre: string): void {
    const proveedor = this.proveedores.find(
      (p) => p.nombreProveedor === nombre
    );
    if (proveedor) {
      this.formDetalleFactura.patchValue({
        nombreProveedor: proveedor.nombreProveedor,
        rtnProveedor: proveedor.rtnProveedor,
        idProveedor: proveedor.idProveedor,
      });
    }
  }

  private cargarProveedores(): void {
    this.proveedorService.listarProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;

        // Filtrado para el autocomplete
        this.proveedoresFiltrados = this.proveedorControl.valueChanges.pipe(
          startWith(''),
          map((valor) =>
            valor ? this.filtrarProveedores(valor) : this.proveedores
          )
        );

        // Suscripción para limpiar campos si no hay proveedor válido
        this.proveedorControl.valueChanges.subscribe((valor) => {
          const proveedorSeleccionado = this.proveedores.find(
            (p) => p.nombreProveedor === valor
          );
          if (!proveedorSeleccionado) {
            // Limpiar campos dependientes
            this.formDetalleFactura.patchValue({
              idProveedor: null,
              nombreProveedor: '',
              rtnProveedor: '',
              establecimiento: '',
              puntoEmision: '',
              tipoDocumento: '',
              correlativo: '',
              cai: '',
              numeroDocumentoRecibo: '',
            });
          }
        });
      },
      error: (err) => console.error('Error cargando proveedores:', err),
    });
  }

  private filtrarProveedores(valor: string): ProveedorCargaCombo[] {
    const filtro = valor.toLowerCase();
    return this.proveedores.filter((p) =>
      p.nombreProveedor.toLowerCase().includes(filtro)
    );
  }

  ngOnInit(): void {
    // Cargar tipos de documento
    this.cargarTipoDocumentoFactura();

    // Inicializar el formulario
    this.inicializarFormulario();

    // Cargar proveedores
    this.cargarProveedores();

    // Actualización de impuestos al cambiar valores
    ['exentas', 'grav15', 'grav18'].forEach((field) => {
      this.formDetalleFactura
        .get(field)
        ?.valueChanges.subscribe(() => this.calcularImpuestosYTotal());
    });

    // Validación del documento completo al cambiar campos del documento
    ['establecimiento', 'puntoEmision', 'tipoDocumento', 'correlativo'].forEach(
      (field) => {
        this.formDetalleFactura
          .get(field)
          ?.valueChanges.subscribe(() => this.validarSiDocumentoCompleto());
      }
    );

    // Inicializamos idFacturaActual con el id del diálogo
    this.idFacturaActual = this.data.idFactura ?? null;

    // Suscripción para limpiar CAI si correlativo es inválido
    this.formDetalleFactura
      .get('correlativo')
      ?.valueChanges.subscribe((valor) => {
        const establecimiento =
          this.formDetalleFactura.get('establecimiento')?.value;
        const puntoEmision = this.formDetalleFactura.get('puntoEmision')?.value;
        const tipoDocumento =
          this.formDetalleFactura.get('tipoDocumento')?.value;
        const idProveedor = this.formDetalleFactura.get('idProveedor')?.value;

        if (
          !valor ||
          valor.trim().length < 8 ||
          !establecimiento ||
          !puntoEmision ||
          !tipoDocumento ||
          !idProveedor
        ) {
          this.formDetalleFactura.patchValue({ cai: '' }, { emitEvent: false });
        }
      });

    // Configuración de modo y carga de datos si se está editando
    this.idFactura = this.data.idFactura;
    this.modo = this.data.modo;
    this.esNuevo = !this.idFactura;

    if (this.idFactura) {
      // Cargar datos de la factura
      this.cargarDatosFactura(this.idFactura);
    }

    if (this.modo === 'ver') {
      this.formDetalleFactura.disable();
      this.proveedorControl.disable();
    } else {
      this.formDetalleFactura.get('fechaRegistro')?.disable();
      this.formDetalleFactura.get('usuarioRegistro')?.disable();
      this.formDetalleFactura.get('fechaModificacion')?.disable();
      this.formDetalleFactura.get('usuarioModificacion')?.disable();
    }

    // Formateo automático del CAI mientras se escribe
    this.proveedorControl.get('cai')?.valueChanges.subscribe((valor) => {
      if (!valor) return;
      const limpio = valor.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      let pos = 0;
      const bloques: string[] = [];
      for (const len of this.longitudesCai) {
        const bloque = limpio.substring(pos, pos + len);
        if (bloque) bloques.push(bloque);
        pos += len;
      }
      const valorFormateado = bloques.join('-');
      if (valorFormateado !== valor) {
        this.proveedorControl
          .get('cai')
          ?.setValue(valorFormateado, { emitEvent: false });
      }
    });
  }

  private inicializarFormulario(): void {
    this.formDetalleFactura = this.fb.group({
      fecha: ['', Validators.required],
      nombrefactura: ['', Validators.required],
      // rtnfactura: [{ value: '', disabled: true }, Validators.required],
      establecimiento: [''],
      puntoEmision: [''],
      tipoDocumento: [''],
      correlativo: [''],
      cai: [''],
      exentas: [0, Validators.required],
      grav15: [0, Validators.required],
      grav18: [0, Validators.required],
      impuesto15: [0, Validators.required],
      impuesto18: [0, Validators.required],
      totalCompra: [0, Validators.required],
      idDocumento: [null, Validators.required],
      numeroDocumentoRecibo: [''],
      kilometrajeRecorrido: [null],
      esGasolina: [false],
      idUsuario: [null, Validators.required], // nuevo campo obligatorio
      idEstado: [null],
      idProveedor: [null, Validators.required], // nuevo campo obligatorio
      rtnProveedor: [{ value: '', disabled: true }], // campo solo lectura
      nombreProveedor: [{ value: '', disabled: true }], // campo solo lectura
      comentarioAdmin: [''],
      fechaContable: [null],
      usuarioRegistro: [{ value: '', disabled: true }],
      fechaRegistro: [{ value: '', disabled: true }],
      fechaModificacion: [{ value: '', disabled: true }],
      usuarioModificacion: [{ value: '', disabled: true }],
      estaActivo: [false, Validators.required],
    });
  }

  private cargarDatosFactura(id: number): void {
    this.facturaService.obtenerFacturaDetalle(id).subscribe({
      next: (factura) => {
        this.proveedorControl.setValue(factura.nombreProveedor ?? '');
        this.estadoActivoOriginal = factura.estaActivo ?? false;
        this.formDetalleFactura.patchValue({
          fecha: factura.fecha ? new Date(factura.fecha) : null,
          nombrefactura: factura.nombreProveedor ?? '',
          rtnProveedor: factura.rtnProveedor ?? '',
          establecimiento: factura.establecimiento ?? '',
          puntoEmision: factura.puntoEmision ?? '',
          tipoDocumento: factura.tipoDocumento ?? '',
          correlativo: factura.correlativo ?? '',
          cai: factura.cai ?? '',
          exentas: factura.exentas ?? 0,
          grav15: factura.grav15 ?? 0,
          grav18: factura.grav18 ?? 0,
          impuesto15: factura.impuesto15 ?? 0,
          impuesto18: factura.impuesto18 ?? 0,
          totalCompra: factura.totalCompra ?? 0,
          idDocumento: factura.idDocumento ?? null,
          numeroDocumentoRecibo: factura.numeroDocumentoRecibo ?? '',
          kilometrajeRecorrido: factura.kilometrajeRecorrido ?? null,
          esGasolina: factura.esGasolina ?? false,
          idProveedor: factura.idProveedor ?? null,
          idUsuario: factura.idUsuario ?? null,
          usuarioRegistro: factura.usuarioRegistro ?? '',
          fechaRegistro: factura.fechaRegistro?.split('T')[0] ?? '',
          fechaModificacion: factura.fechaModificacion?.split('T')[0] ?? '',
          usuarioModificacion: factura.usuarioModificacion ?? '',
          estaActivo: factura.estaActivo ?? false,
          idEstado: factura.idEstado ?? null,
        });
      },
      error: (err) => {
        console.error('Error cargando factura:', err);
        this.notificacionService.mostrarMensajeError(
          'Error',
          'No se pudo cargar la factura'
        );
      },
    });
  }

  private cargarTipoDocumentoFactura(): void {
    this.tipoDocumentoService.obtenerTipoDocumentoFactura().subscribe({
      next: (tipos) => {
        this.tipoDocumentoFactura = tipos;
      },
      error: (err) => {
        console.error('Error cargando tipos de documento:', err);
        this.notificacionService.mostrarMensajeError(
          'Error',
          'No se pudo cargar los tipos de documento'
        );
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  guardarCambios(): void {
    if (this.modoSoloLectura) return;

    // Preguntar antes de guardar
    this.notificacionService
      .confirmar('Confirmar', '¿Está seguro de actualizar la factura?')
      .subscribe((confirmado) => {
        if (!confirmado) return; // Si cancela, no hace nada

        // Validar formulario
        if (this.formDetalleFactura.invalid) {
          this.formDetalleFactura.markAllAsTouched();
          this.notificacionService.mostrarMensajeError(
            'Formulario inválido',
            'Por favor complete correctamente todos los campos obligatorios.'
          );
          return;
        }

        const formValue = this.formDetalleFactura.getRawValue();

        // Sincronizar proveedor seleccionado
        const proveedorSeleccionado = this.proveedores.find(
          (p) => p.nombreProveedor === this.proveedorControl.value
        );
        if (proveedorSeleccionado) {
          formValue.idProveedor = proveedorSeleccionado.idProveedor;
          this.formDetalleFactura.patchValue({
            idProveedor: proveedorSeleccionado.idProveedor,
          });
        }

        if (!formValue.idProveedor) {
          this.notificacionService.mostrarMensajeError(
            'Proveedor no seleccionado',
            'Por favor seleccione un proveedor antes de guardar.'
          );
          return;
        }

        // Construir documento fiscal
        const documentoFiscal = this.construirDocumentoFiscal();
        if (!documentoFiscal) {
          this.notificacionService.mostrarMensajeError(
            'Documento incompleto',
            'Debe completar todos los campos del documento fiscal.'
          );
          return;
        }

        // Validar documento con backend
        this.caiProveedorService
          .validarDocumento(
            formValue.idProveedor,
            documentoFiscal,
            this.idFacturaActual // ignorar la factura actual
          )
          .subscribe({
            next: (resp: any) => {
              if (!resp.success) {
                this.formDetalleFactura
                  .get('correlativo')
                  ?.setErrors(
                    resp.existe
                      ? { yaRegistrado: true }
                      : { rangoInvalido: true }
                  );
                this.formDetalleFactura.patchValue({ cai: '' });

                this.notificacionService.mostrarMensajeError(
                  resp.existe ? 'Documento duplicado' : 'Documento inválido',
                  resp.message ||
                    'El documento fiscal no es válido para este proveedor.'
                );
                return;
              }

              // Documento válido → preparar objeto de actualización
              const facturaEditada: FacturaCompleta = {
                ...formValue,
                cai: resp.cai,
                fechaModificacion: new Date().toISOString(),
                usuarioModificacion:
                  sessionStorage.getItem('codigoUsuario') || 'SISTEMA',
              };

              // Actualizar factura
              this.facturaService
                .actualizarFactura(this.idFacturaActual!, facturaEditada)
                .subscribe({
                  next: () => {
                    this.notificacionService.mostrarMensajeExito(
                      'Actualización exitosa',
                      'La factura ha sido actualizada correctamente.'
                    );
                    this.dialogRef.close('actualizado');
                  },
                  error: (error) => {
                    console.error('Error actualizando factura:', error);
                    const mensajeBackend =
                      error?.error?.message ||
                      'Ocurrió un error al actualizar la factura.';
                    this.notificacionService.mostrarMensajeError(
                      'Error al actualizar',
                      mensajeBackend
                    );
                  },
                });
            },
            error: (err) => {
              console.error('Error validando documento fiscal:', err);
              this.notificacionService.mostrarMensajeError(
                'Error',
                'No se pudo validar el documento fiscal. Intente nuevamente.'
              );
            },
          });
      });
  }

  private DECIMALES = 5; // ← ahora usa 5 decimales

  private calcularImpuestosYTotal(): void {
    const exentas = this.parseNumber(
      this.formDetalleFactura.get('exentas')?.value
    );
    const grav15 = this.parseNumber(
      this.formDetalleFactura.get('grav15')?.value
    );
    const grav18 = this.parseNumber(
      this.formDetalleFactura.get('grav18')?.value
    );

    let impuesto15 = grav15 > 0 ? grav15 * 0.15 : 0;
    let impuesto18 = grav18 > 0 ? grav18 * 0.18 : 0;

    // Redondear usando el número de decimales configurado
    impuesto15 = this.redondear(impuesto15);
    impuesto18 = this.redondear(impuesto18);

    let totalCompra = exentas + grav15 + grav18 + impuesto15 + impuesto18;
    totalCompra = this.redondear(totalCompra);

    this.formDetalleFactura.patchValue(
      {
        impuesto15,
        impuesto18,
        totalCompra,
      },
      { emitEvent: false }
    );
  }

  // Método helper para redondear a los decimales deseados
  private redondear(valor: number): number {
    const factor = Math.pow(10, this.DECIMALES);
    return Math.round(valor * factor) / factor;
  }

  private parseNumber(value: any): number {
    const n = Number(value);
    return isNaN(n) || n === null || value === '' ? 0 : n;
  }

  private validarSiDocumentoCompleto(): void {
    const documentoCompleto = this.construirDocumentoFiscal();
    const idProveedor = this.formDetalleFactura.get('idProveedor')?.value;

    if (documentoCompleto && idProveedor) {
      this.caiProveedorService
        .validarDocumento(idProveedor, documentoCompleto)
        .subscribe({
          next: (resp: any) => {
            if (resp.success) {
              this.formDetalleFactura.patchValue({ cai: resp.cai });
              this.formDetalleFactura.get('correlativo')?.setErrors(null);
            } else {
              this.formDetalleFactura.patchValue({ cai: '' });
              if (resp.existe) {
                this.formDetalleFactura
                  .get('correlativo')
                  ?.setErrors({ yaRegistrado: true });
              } else {
                this.formDetalleFactura
                  .get('correlativo')
                  ?.setErrors({ rangoInvalido: true });
              }
            }
          },
          error: (err) => {
            console.error('Error validando documento:', err);
            this.formDetalleFactura.patchValue({ cai: '' });
            this.formDetalleFactura
              .get('correlativo')
              ?.setErrors({ errorValidacion: true });
          },
        });
    } else {
      this.formDetalleFactura.patchValue({ cai: '' });
      this.formDetalleFactura.get('correlativo')?.setErrors(null);
    }
  }

  private construirDocumentoFiscal(): string | null {
    const establecimiento =
      this.formDetalleFactura.get('establecimiento')?.value;
    const puntoEmision = this.formDetalleFactura.get('puntoEmision')?.value;
    const tipoDocumento = this.formDetalleFactura.get('tipoDocumento')?.value;
    const correlativo = this.formDetalleFactura.get('correlativo')?.value;
    if (establecimiento && puntoEmision && tipoDocumento && correlativo) {
      return `${establecimiento}-${puntoEmision}-${tipoDocumento}-${correlativo}`;
    }
    return null;
  }

  moverFocus(event: Event, siguienteInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= input.maxLength) {
      siguienteInput?.focus();
    }
  }

  validarDocumentoFiscal(): void {
    const idProveedor = this.formDetalleFactura.get('idProveedor')?.value;
    const establecimiento =
      this.formDetalleFactura.get('establecimiento')?.value;
    const puntoEmision = this.formDetalleFactura.get('puntoEmision')?.value;
    const tipoDocumento = this.formDetalleFactura.get('tipoDocumento')?.value;
    const correlativo = this.formDetalleFactura.get('correlativo')?.value;

    if (!idProveedor) {
      this.notificacionService.mostrarMensajeError(
        'Seleccione un proveedor antes de validar.'
      );
      return;
    }

    const documentoFiscal = `${establecimiento}-${puntoEmision}-${tipoDocumento}-${correlativo}`;

    // Llamada al backend pasando el id de la factura actual para ignorarla
    this.caiProveedorService
      .validarDocumento(idProveedor, documentoFiscal, this.idFacturaActual)
      .subscribe({
        next: (resp: any) => {
          if (resp.existe) {
            // Documento ya registrado en otra factura
            this.formDetalleFactura
              .get('correlativo')
              ?.setErrors({ yaRegistrado: true });
            this.formDetalleFactura.patchValue({ cai: '' });
          } else if (!resp.success) {
            // Documento fuera de rango del proveedor
            this.formDetalleFactura
              .get('correlativo')
              ?.setErrors({ rangoInvalido: true });
            this.formDetalleFactura.patchValue({ cai: '' });
          } else {
            // Documento válido
            this.formDetalleFactura.get('correlativo')?.setErrors(null);
            this.formDetalleFactura.patchValue({ cai: resp.cai });
          }
        },
        error: (err) => {
          console.error('Error validando documento:', err);
          this.formDetalleFactura
            .get('correlativo')
            ?.setErrors({ errorValidacion: true });
          this.formDetalleFactura.patchValue({ cai: '' });
        },
      });
  }
}
