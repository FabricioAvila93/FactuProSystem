import { Component, inject, OnInit, Optional } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  DateAdapter,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TipoDocumentoFactura } from '../../../interfaces/documentoFactura/TipoDocumentoFactura';
import { ProveedorCargaCombo } from '../../../interfaces/proveedor/ProveedorCargaCombo';
import { TipoDocumentoFacturaService } from '../../../services/tipoDocumentoFactura/tipo-documento-factura.service';
import { ProveedorCaiRangoService } from '../../../services/proveedorCaiRango/proveedor-cai-rango.service';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import { FacturasService } from '../../../services/facturas/facturas.service';
import { ProveedorService } from '../../../services/proveedor/proveedor.service';
import { MY_DATE_FORMATS } from '../../../shared/calendar/date-format';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-agregar-factura',
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
  templateUrl: './registro-factura.component.html',
  styleUrls: ['./registro-factura.component.css'],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
  ],
})
export class RegistroFacturaComponent {
  formRegistroFactura!: FormGroup;
  tipoDocumentoFactura: TipoDocumentoFactura[] = [];
  proveedores: ProveedorCargaCombo[] = [];
  proveedorControl = new FormControl('');
  proveedoresFiltrados!: Observable<ProveedorCargaCombo[]>;
  esFactura: boolean = false;
  esGasolina = false;
  modoSoloLectura = false;
  mostrarKm = false;
  private longitudesCai = [6, 6, 6, 6, 6, 2];

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private documentoService = inject(TipoDocumentoFacturaService);
  private proveedorService = inject(ProveedorService);
  private caiProveedorService = inject(ProveedorCaiRangoService);
  private notificacionService = inject(NotificacionService);
  private facturaService = inject(FacturasService);
  public dialogRef? = inject(MatDialogRef<RegistroFacturaComponent>);

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { idFactura?: number }
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDocumento();
    this.cargarProveedores();

    this.route.queryParams.subscribe((params) => {
      this.modoSoloLectura = params['modo'] === 'ver';
      if (this.modoSoloLectura) {
        this.formRegistroFactura.disable();
      }
    });

    // Detecta cambios en el tipo de documento
    this.formRegistroFactura
      .get('idDocumento')
      ?.valueChanges.subscribe((valor) => {
        this.esFactura = Number(valor) === 1; // <-- FORZAR A NÚMERO
        if (!this.esFactura) {
          this.formRegistroFactura.patchValue({
            kilometrajeRecorrido: null,
            esGasolina: false,
          });
          this.formRegistroFactura
            .get('kilometrajeRecorrido')
            ?.clearValidators();
        } else {
          this.formRegistroFactura
            .get('kilometrajeRecorrido')
            ?.setValidators([Validators.min(0)]);
        }
        this.formRegistroFactura
          .get('kilometrajeRecorrido')
          ?.updateValueAndValidity();

        // DOC. RECIBO siempre solo lectura
        this.formRegistroFactura.get('numeroDocumentoRecibo')?.disable();

        // Detectar cambios en tipo de documento y correlativo
        this.formRegistroFactura
          .get('idDocumento')
          ?.valueChanges.subscribe(() => this.actualizarDocRecibo());
        this.formRegistroFactura
          .get('correlativo')
          ?.valueChanges.subscribe(() => this.actualizarDocRecibo());
      });

    // Detecta cuando se borra el proveedor
    this.proveedorControl.valueChanges.subscribe((valor) => {
      if (!valor) {
        // Limpiar campos relacionados
        this.formRegistroFactura.patchValue({
          nombreProveedor: '',
          rtnProveedor: '',
          idProveedor: null,
          establecimiento: '',
          puntoEmision: '',
          tipoDocumento: '',
          correlativo: '',
          cai: '',
        });
        this.esFactura = false;
        this.esGasolina = false;
      }
    });

    // Validar documento fiscal cuando cambian sus campos
    ['establecimiento', 'puntoEmision', 'tipoDocumento', 'correlativo'].forEach(
      (field) => {
        this.formRegistroFactura
          .get(field)
          ?.valueChanges.subscribe(() => this.validarSiDocumentoCompleto());
      }
    );

    // Calcular impuestos en tiempo real
    ['exentas', 'grav15', 'grav18'].forEach((field) => {
      this.formRegistroFactura
        .get(field)
        ?.valueChanges.subscribe(() => this.calcularImpuestosYTotal());
    });

    // Formatear CAI automáticamente
    this.formRegistroFactura.get('cai')?.valueChanges.subscribe((valor) => {
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
        this.formRegistroFactura
          .get('cai')
          ?.setValue(valorFormateado, { emitEvent: false });
      }
    });
  }

  private inicializarFormulario(): void {
    const idUsuarioStr = sessionStorage.getItem('idUsuario');
    this.formRegistroFactura = this.fb.group({
      fecha: ['', Validators.required],
      nombreProveedor: ['', Validators.required],
      rtnProveedor: [{ value: '', disabled: true }, Validators.required],
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
      idUsuario: [idUsuarioStr ? +idUsuarioStr : null, Validators.required],
      idDocumento: [null, Validators.required],
      numeroDocumentoRecibo: [''],
      kilometrajeRecorrido: [null],
      esGasolina: [false],
      idProveedor: [null, Validators.required],
    });
  }

  private cargarDocumento(): void {
    this.documentoService.obtenerTipoDocumentoFactura().subscribe({
      next: (data) => {
        console.log('Documentos recibidos:', data); // Para depurar
        this.tipoDocumentoFactura = data;
      },
      error: (err) => console.error('Error cargando documentos:', err),
    });
  }

  private cargarProveedores(): void {
    this.proveedorService.listarProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.proveedoresFiltrados = this.proveedorControl.valueChanges.pipe(
          startWith(''),
          map((valor) =>
            valor ? this.filtrarProveedores(valor) : this.proveedores
          )
        );
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

  onProveedorSeleccionado(nombre: string): void {
    const proveedor = this.proveedores.find(
      (p) => p.nombreProveedor === nombre
    );
    if (proveedor) {
      this.formRegistroFactura.patchValue({
        nombreProveedor: proveedor.nombreProveedor,
        rtnProveedor: proveedor.rtnProveedor,
        idProveedor: proveedor.idProveedor,
      });
    }
  }

  onGasolinaChange(event: any): void {
    this.esGasolina = event.target.checked;
    this.formRegistroFactura.patchValue({ esGasolina: this.esGasolina });
    const campoKm = this.formRegistroFactura.get('kilometrajeRecorrido');
    if (this.esGasolina) {
      campoKm?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      campoKm?.clearValidators();
      this.formRegistroFactura.patchValue({ kilometrajeRecorrido: null });
    }
    campoKm?.updateValueAndValidity();
  }

  guardarFactura(): void {
    if (this.modoSoloLectura) return;

    // Preguntar antes de guardar
    this.notificacionService
      .confirmar('Confirmar', '¿Está seguro de guardar la factura?')
      .subscribe((confirmado) => {
        if (!confirmado) return; // Si cancela, no hace nada

        // Continuar con la lógica de cálculo y validación
        this.calcularImpuestosYTotal();

        if (this.formRegistroFactura.invalid) {
          this.formRegistroFactura.markAllAsTouched();
          this.notificacionService.mostrarMensajeError(
            'Campos incompletos',
            'Por favor completa todos los campos correctamente.'
          );
          return;
        }

        const documentoCompleto = this.construirDocumentoFiscal();
        const idProveedor = this.formRegistroFactura.get('idProveedor')?.value;

        if (!documentoCompleto || !idProveedor) {
          this.notificacionService.mostrarMensajeError(
            'Datos faltantes',
            'Debe seleccionar un proveedor válido y completar el documento fiscal.'
          );
          return;
        }

        this.caiProveedorService
          .validarDocumento(idProveedor, documentoCompleto)
          .subscribe({
            next: (resp: any) => {
              if (resp.success) {
                const usuarioRegistro = sessionStorage.getItem('codigoUsuario');
                const facturaEnviar = {
                  ...this.formRegistroFactura.getRawValue(),
                  usuarioRegistro: usuarioRegistro
                    ? usuarioRegistro.toUpperCase()
                    : 'SISTEMA',
                  nombreProveedor:
                    this.formRegistroFactura.value.nombreProveedor.toUpperCase(),
                  rtnProveedor: this.formRegistroFactura
                    .getRawValue()
                    .rtnProveedor.toUpperCase(),
                  cai: resp.cai.toUpperCase(),
                  fechaActualizacion: this.formRegistroFactura.value.fecha,
                };

                this.facturaService.registrarFactura(facturaEnviar).subscribe({
                  next: () => {
                    this.notificacionService.mostrarMensajeExito(
                      'Éxito',
                      'Factura guardada correctamente.'
                    );
                    this.dialogRef?.close('guardado');
                  },
                  error: (err) => {
                    console.error(err);
                    this.notificacionService.mostrarMensajeError(
                      'Error',
                      'Ocurrió un error al guardar la factura.'
                    );
                  },
                });
              } else {
                if (resp.existe) {
                  this.notificacionService.mostrarMensajeError(
                    'Documento duplicado',
                    'Este documento fiscal ya pertenece a otra factura.'
                  );
                } else {
                  this.notificacionService.mostrarMensajeError(
                    'Documento inválido',
                    resp.message ||
                      'El documento fiscal no corresponde al proveedor o está fuera del rango CAI válido.'
                  );
                }
              }
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

  private calcularImpuestosYTotal(): void {
    const exentas = this.parseNumber(
      this.formRegistroFactura.get('exentas')?.value
    );
    const grav15 = this.parseNumber(
      this.formRegistroFactura.get('grav15')?.value
    );
    const grav18 = this.parseNumber(
      this.formRegistroFactura.get('grav18')?.value
    );

    const impuesto15 = grav15 > 0 ? parseFloat((grav15 * 0.15).toFixed(2)) : 0;
    const impuesto18 = grav18 > 0 ? parseFloat((grav18 * 0.18).toFixed(2)) : 0;

    const totalCompra = parseFloat(
      (exentas + grav15 + grav18 + impuesto15 + impuesto18).toFixed(2)
    );

    this.formRegistroFactura.patchValue(
      {
        impuesto15,
        impuesto18,
        totalCompra,
      },
      { emitEvent: false }
    );
  }

  private construirDocumentoFiscal(): string | null {
    const establecimiento =
      this.formRegistroFactura.get('establecimiento')?.value;
    const puntoEmision = this.formRegistroFactura.get('puntoEmision')?.value;
    const tipoDocumento = this.formRegistroFactura.get('tipoDocumento')?.value;
    const correlativo = this.formRegistroFactura.get('correlativo')?.value;
    if (establecimiento && puntoEmision && tipoDocumento && correlativo) {
      return `${establecimiento}-${puntoEmision}-${tipoDocumento}-${correlativo}`;
    }
    return null;
  }

  /*
private validarSiDocumentoCompleto(): void {
  const documentoCompleto = this.construirDocumentoFiscal();
  const idProveedor = this.formRegistroFactura.get('idProveedor')?.value;
  const correlativo = this.formRegistroFactura.get('correlativo')?.value;

  // Validar solo si correlativo tiene 8 dígitos y documento está completo
  if (documentoCompleto && idProveedor && correlativo?.toString().length === 8) {
    this.caiProveedorService.validarDocumento(idProveedor, documentoCompleto).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.formRegistroFactura.patchValue({ cai: resp.cai });
          this.formRegistroFactura.get('correlativo')?.setErrors(null);
        } else {
          this.formRegistroFactura.patchValue({ cai: '' });
          if (resp.existe) {
            this.formRegistroFactura.get('correlativo')?.setErrors({ yaRegistrado: true });
          } else {
            this.formRegistroFactura.get('correlativo')?.setErrors({ rangoInvalido: true });
          }
        }
      },
      error: (err) => {
        console.error('Error validando documento:', err);
        this.formRegistroFactura.patchValue({ cai: '' });
        this.formRegistroFactura.get('correlativo')?.setErrors({ errorValidacion: true });
      },
    });
  } else {
    // Si no está completo, limpiar CAI y errores
    this.formRegistroFactura.patchValue({ cai: '' });
    this.formRegistroFactura.get('correlativo')?.setErrors(null);
  }
}*/

  private validarSiDocumentoCompleto(): void {
    const documentoCompleto = this.construirDocumentoFiscal();
    const idProveedor = this.formRegistroFactura.get('idProveedor')?.value;
    const correlativo = this.formRegistroFactura.get('correlativo')?.value;

    if (
      documentoCompleto &&
      idProveedor &&
      correlativo?.toString().length === 8
    ) {
      this.caiProveedorService
        .validarDocumento(idProveedor, documentoCompleto)
        .subscribe({
          next: (resp: any) => {
            if (resp.success) {
              this.formRegistroFactura.patchValue({ cai: resp.cai });
              this.formRegistroFactura.get('correlativo')?.setErrors(null);
            } else {
              this.formRegistroFactura.patchValue({ cai: '' });

              if (resp.existe) {
                this.formRegistroFactura
                  .get('correlativo')
                  ?.setErrors({ yaRegistrado: true });
              } else if (
                resp.message?.includes('inactivo') ||
                resp.message?.includes('expirado')
              ) {
                // Nuevo error para CAI inactivo o expirado
                this.formRegistroFactura
                  .get('correlativo')
                  ?.setErrors({ caiInactivo: true });
              } else {
                this.formRegistroFactura
                  .get('correlativo')
                  ?.setErrors({ rangoInvalido: true });
              }
            }
          },
          error: (err) => {
            console.error('Error validando documento:', err);
            this.formRegistroFactura.patchValue({ cai: '' });
            this.formRegistroFactura
              .get('correlativo')
              ?.setErrors({ errorValidacion: true });
          },
        });
    } else {
      this.formRegistroFactura.patchValue({ cai: '' });
      this.formRegistroFactura.get('correlativo')?.setErrors(null);
    }
  }

  private parseNumber(value: any): number {
    const n = Number(value);
    return isNaN(n) || n === null || value === '' ? 0 : n;
  }

  moverFocus(event: Event, siguienteInput: HTMLInputElement | null) {
    const input = event.target as HTMLInputElement;
    if (input.value.length >= input.maxLength) {
      siguienteInput?.focus();
    }
  }

  // Construye el documento fiscal concatenado

  // Método para validar documento fiscal enviando idProveedor y documentoFiscal completo
  validarDocumentoFiscal(documentoFiscal: string): void {
    const idProveedor = this.formRegistroFactura.get('idProveedor')?.value;

    if (!idProveedor) {
      this.notificacionService.mostrarMensajeError(
        'Seleccione un proveedor antes de validar.'
      );
      return;
    }

    this.caiProveedorService
      .validarDocumento(idProveedor, documentoFiscal)
      .subscribe({
        next: (resp: any) => {
          if (resp.existe) {
            // Documento ya registrado en otra factura
            this.formRegistroFactura
              .get('correlativo')
              ?.setErrors({ yaRegistrado: true });
            this.formRegistroFactura.patchValue({ cai: '' });
          } else if (!resp.success) {
            // Documento fuera de rango del proveedor
            this.formRegistroFactura
              .get('correlativo')
              ?.setErrors({ rangoInvalido: true });
            this.formRegistroFactura.patchValue({ cai: '' });
          } else {
            // Documento válido
            this.formRegistroFactura.get('correlativo')?.setErrors(null);
            this.formRegistroFactura.patchValue({ cai: resp.cai });
          }
        },
        error: (err) => {
          console.error('Error validando documento:', err);
          this.formRegistroFactura
            .get('correlativo')
            ?.setErrors({ errorValidacion: true });
          this.formRegistroFactura.patchValue({ cai: '' });
        },
      });
  }

  cancelar(): void {
    this.dialogRef?.close();
  }

  actualizarDocRecibo() {
    const tipoDoc = this.formRegistroFactura.get('idDocumento')?.value;
    const correlativo = this.formRegistroFactura.get('correlativo')?.value;
    const campoRecibo = this.formRegistroFactura.get('numeroDocumentoRecibo');

    if (tipoDoc == 2) {
      // CO - Otros comprobantes de pago
      campoRecibo?.setValue(correlativo || '');
    } else {
      // FA u otros tipos
      campoRecibo?.setValue('');
    }
  }
}
