import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatOptionModule,
  NativeDateAdapter,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProveedorCaiRangoService } from '../../../services/proveedorCaiRango/proveedor-cai-rango.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DetalleProveedorComponent } from '../../proveedor/detalle-proveedor/detalle-proveedor.component';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import { ProveedorCaiRangoUpdate } from '../../../interfaces/proveedorCaiRango/ProveedorCaiRangoUpdate';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MY_DATE_FORMATS } from '../../../shared/calendar/date-format';

@Component({
  selector: 'app-detalle-cai-rango',
  standalone: true,
  imports: [
    MatOptionModule,
    MatCard,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDatepicker,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  templateUrl: './detalle-cai-rango.component.html',
  styleUrls: ['./detalle-cai-rango.component.css'],
  providers: [
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
  ],
})
export class DetalleCaiRangoComponent {
  formCaiRango!: FormGroup;
  idRangoCAI: number | null = null;
  modo: 'ver' | 'editar' = 'ver';
  esNuevo: boolean = true;
  estadoActivoOriginal: boolean = false;
  nombreProveedor: string = '';
  error: string = '';
  cargando: boolean = false;

  private fb = inject(FormBuilder);
  private proveedorRangoCaiService = inject(ProveedorCaiRangoService);
  private dialogRef = inject(MatDialogRef<DetalleProveedorComponent>);
  private data = inject(MAT_DIALOG_DATA) as {
    idRangoCAI: number;
    modo: 'ver' | 'editar';
  };
  private notificacionService = inject(NotificacionService);

  constructor() {}

  ngOnInit(): void {
    this.inicializarFormulario();

    this.idRangoCAI = this.data.idRangoCAI;
    this.modo = this.data.modo;
    this.esNuevo = !this.idRangoCAI;

    if (this.idRangoCAI) {
      this.cargarDatosCaiRango(this.idRangoCAI);
    }

    if (this.modo === 'ver') {
      this.formCaiRango.disable();
    } else {
      this.formCaiRango.get('fechaRegistro')?.disable();
      this.formCaiRango.get('usuarioRegistro')?.disable();
      this.formCaiRango.get('fechaModificacion')?.disable();
      this.formCaiRango.get('usuarioModificacion')?.disable();
      this.formCaiRango.get('documentoFiscal_Inicio')?.disable();
      this.formCaiRango.get('documentoFiscal_Fin')?.disable();
    }

    [
      'codigoEstablecimiento',
      'puntoEmision',
      'tipoDocumento',
      'correlativoInicio',
      'correlativoFin',
      'fechaExpiracion',
    ].forEach((campo) => {
      this.formCaiRango
        .get(campo)
        ?.valueChanges.subscribe(() => this.actualizarDocumentosFiscales());
    });
  }

  private inicializarFormulario(): void {
    this.formCaiRango = this.fb.group({
      nombreProveedor: ['', Validators.required],
      cai: ['', Validators.required],
      codigoEstablecimiento: ['', Validators.required],
      puntoEmision: ['', Validators.required],
      tipoDocumento: ['', Validators.required],
      correlativoInicio: ['', Validators.required],
      correlativoFin: ['', Validators.required],
      documentoFiscal_Inicio: ['', Validators.required],
      documentoFiscal_Fin: ['', Validators.required],
      usuarioRegistro: [{ value: '', disabled: true }],
      fechaRegistro: [{ value: '', disabled: true }],
      fechaModificacion: [{ value: '', disabled: true }],
      usuarioModificacion: [{ value: '', disabled: true }],
      fechaExpiracion: ['', Validators.required],
      estaActivo: [false, Validators.required],
    });
  }

  private cargarDatosCaiRango(id: number): void {
    this.cargando = true;
    this.error = '';

    this.proveedorRangoCaiService.obtenerRangoCaiDetalle(id).subscribe({
      next: (rangoCai) => {
        this.estadoActivoOriginal = rangoCai.estaActivo ?? false;
        this.nombreProveedor = rangoCai.nombreProveedor ?? '';

        this.formCaiRango.patchValue({
          nombreProveedor: rangoCai.nombreProveedor ?? '',
          cai: rangoCai.cai,
          codigoEstablecimiento: rangoCai.codigoEstablecimiento,
          puntoEmision: rangoCai.puntoEmision,
          tipoDocumento: rangoCai.tipoDocumento,
          correlativoInicio: rangoCai.correlativoInicio,
          correlativoFin: rangoCai.correlativoFin,
          documentoFiscal_Inicio: rangoCai.documentoFiscal_Inicio,
          documentoFiscal_Fin: rangoCai.documentoFiscal_Fin,
          fechaRegistro: rangoCai.fechaRegistro?.split('T')[0] ?? '',
          fechaModificacion: rangoCai.fechaModificacion?.split('T')[0] ?? '',
          usuarioRegistro: rangoCai.usuarioRegistro ?? '',
          usuarioModificacion: rangoCai.usuarioModificacion ?? '',
          fechaExpiracion: rangoCai.fechaExpiracion?.split('T')[0] ?? '',
          estaActivo: rangoCai.estaActivo ?? false,
        });

        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los datos del rango CAI.';
        this.cargando = false;
        console.error(err);
        this.notificacionService.mostrarMensajeError('Error', this.error);
      },
    });
  }

  onInputUppercase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  procesarErrores(error: any): void {
    const errorResponse = error?.error;

    // Mensaje general enviado desde backend
    const mensajeGeneral = errorResponse?.message;
    if (mensajeGeneral) {
      this.notificacionService.mostrarMensajeError('Error', mensajeGeneral);
      return;
    }

    // Otros errores no controlados
    const status = error?.status;
    const statusText = error?.statusText;

    let mensajeAlternativo = 'Ha ocurrido un error inesperado.';

    if (status === 0) {
      mensajeAlternativo = 'No se pudo conectar con el servidor.';
    } else if (status === 500) {
      mensajeAlternativo = 'Error interno del servidor.';
    } else if (statusText) {
      mensajeAlternativo = statusText;
    }

    this.notificacionService.mostrarMensajeError('Error', mensajeAlternativo);
  }

  private obtenerErroresFormulario(): any {
    const errores: any = {};
    Object.keys(this.formCaiRango.controls).forEach((campo) => {
      const control = this.formCaiRango.get(campo);
      if (control && control.invalid) {
        errores[campo] = control.errors;
      }
    });
    return errores;
  }

  guardarCambios(): void {
    if (this.formCaiRango.invalid) {
      console.log('Errores del formulario:', this.obtenerErroresFormulario());
      this.notificacionService.mostrarMensajeError(
        'Formulario inválido',
        'Por favor complete correctamente el formulario.'
      );
      return;
    }

    if (this.idRangoCAI === null || this.idRangoCAI === undefined) {
      this.notificacionService.mostrarMensajeError(
        'ID inválido',
        'ID de rango CAI no válido.'
      );
      return;
    }

    const formValue = this.formCaiRango.getRawValue();

    const rangoCaiEditado: ProveedorCaiRangoUpdate = {
      idRangoCAI: this.idRangoCAI,
      cai: formValue.cai,
      codigoEstablecimiento: formValue.codigoEstablecimiento,
      puntoEmision: formValue.puntoEmision,
      tipoDocumento: formValue.tipoDocumento,
      correlativoInicio: formValue.correlativoInicio,
      correlativoFin: formValue.correlativoFin,
      documentoFiscal_Inicio: formValue.documentoFiscal_Inicio,
      documentoFiscal_Fin: formValue.documentoFiscal_Fin,
      fechaModificacion: new Date().toISOString(),
      usuarioModificacion: sessionStorage.getItem('codigoUsuario') || '',
      fechaExpiracion: formValue.fechaExpiracion,
      estaActivo: formValue.estaActivo,
    };

    if (!rangoCaiEditado.usuarioModificacion) {
      this.notificacionService.mostrarMensajeError(
        'Error de sesión',
        'No hay usuario logueado. Por favor inicie sesión de nuevo.'
      );
      return;
    }

    // Confirmación antes de actualizar
    this.notificacionService
      .confirmar('Confirmación', '¿Desea actualizar este rango de CAI?')
      .subscribe((confirmado: boolean) => {
        if (!confirmado) return;

        this.proveedorRangoCaiService
          .actualizarRangoCai(this.idRangoCAI!, rangoCaiEditado)
          .subscribe({
            next: () => {
              let mensajeEstado = '';
              if (this.estadoActivoOriginal !== rangoCaiEditado.estaActivo) {
                mensajeEstado = rangoCaiEditado.estaActivo
                  ? 'Rango CAI activado correctamente.'
                  : 'Rango CAI inactivado correctamente.';
                this.notificacionService.mostrarMensajeExito(
                  'Estado actualizado',
                  mensajeEstado
                );
              } else {
                this.notificacionService.mostrarMensajeExito(
                  'Actualización exitosa',
                  'El rango CAI ha sido actualizado correctamente.'
                );
              }
              this.dialogRef.close('actualizado');
            },
            error: (error) => {
              console.error('Error actualizando rango CAI:', error);
              const mensajeBackend =
                error?.error?.message ||
                'Ocurrió un error al intentar actualizar el rango CAI.';
              this.notificacionService.mostrarMensajeError(
                'Error al actualizar',
                mensajeBackend
              );
            },
          });
      });
  }

  actualizarDocumentosFiscales(): void {
    const establecimiento = this.formCaiRango.get(
      'codigoEstablecimiento'
    )?.value;
    const punto = this.formCaiRango.get('puntoEmision')?.value;
    const tipo = this.formCaiRango.get('tipoDocumento')?.value;
    const correlativoInicio = this.formCaiRango.get('correlativoInicio')?.value;
    const correlativoFin = this.formCaiRango.get('correlativoFin')?.value;

    const todosLlenos =
      establecimiento && punto && tipo && correlativoInicio && correlativoFin;

    if (todosLlenos) {
      const docInicio = `${establecimiento}-${punto}-${tipo}-${correlativoInicio}`;
      const docFin = `${establecimiento}-${punto}-${tipo}-${correlativoFin}`;

      this.formCaiRango.get('documentoFiscal_Inicio')?.setValue(docInicio);
      this.formCaiRango.get('documentoFiscal_Fin')?.setValue(docFin);
    } else {
      this.formCaiRango.get('documentoFiscal_Inicio')?.setValue('');
      this.formCaiRango.get('documentoFiscal_Fin')?.setValue('');
    }
  }

  // Valida que solo se puedan escribir números en el campo identificación
  validarSoloNumeros(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
    ];
    if (allowedKeys.includes(event.key)) return;

    const pattern = /[0-9]/;
    if (!pattern.test(event.key)) {
      event.preventDefault();
    }
  }
}
