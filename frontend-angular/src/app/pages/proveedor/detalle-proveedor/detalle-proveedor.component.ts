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
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProveedorService } from '../../../services/proveedor/proveedor.service';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProveedorUpdate } from '../../../interfaces/proveedor/ProveedorUpdate';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-detalle-proveedor',
  standalone: true,
  imports: [
    MatCheckbox,
    MatOptionModule,
    MatCard,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './detalle-proveedor.component.html',
  styleUrl: './detalle-proveedor.component.css',
})
export class DetalleProveedorComponent implements OnInit {
  formProveedor!: FormGroup;
  idProveedor: number | null = null;
  modo: 'ver' | 'editar' = 'ver';
  esNuevo: boolean = true;
  estadoActivoOriginal: boolean = false;
  error: string = '';
  cargando: boolean = false;

  private fb = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);
  private dialogRef = inject(MatDialogRef<DetalleProveedorComponent>);
  private data = inject(MAT_DIALOG_DATA) as {
    idProveedor: number;
    modo: 'ver' | 'editar';
  };
  private notificacionService = inject(NotificacionService);

  constructor() {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.idProveedor = this.data.idProveedor;
    this.modo = this.data.modo;

    this.esNuevo = !this.idProveedor;

    if (this.idProveedor) {
      this.cargarDatosProveedor(this.idProveedor);
    }

    if (this.modo === 'ver') {
      this.formProveedor.disable();
    } else {
      this.formProveedor.get('fechaRegistro')?.disable();
      this.formProveedor.get('usuarioRegistro')?.disable();
      this.formProveedor.get('fechaModificacion')?.disable();
      this.formProveedor.get('usuarioModificacion')?.disable();
    }
  }

  private inicializarFormulario(): void {
    this.formProveedor = this.fb.group({
      rtnProveedor: ['', Validators.required],
      nombreProveedor: ['', Validators.required],
      telefono: [''],
      direccion: [''],
      correo: ['', [Validators.email]],
      usuarioRegistro: [{ value: '', disabled: true }],
      fechaRegistro: [{ value: '', disabled: true }],
      fechaModificacion: [{ value: '', disabled: true }],
      usuarioModificacion: [{ value: '', disabled: true }],
      estaActivo: [false, Validators.required],
    });
  }

  private cargarDatosProveedor(id: number): void {
    this.proveedorService.obtenerProveedorDetalle(id).subscribe({
      next: (proveedor) => {
        this.estadoActivoOriginal = proveedor.estaActivo;
        this.formProveedor.patchValue({
          rtnProveedor: proveedor.rtnProveedor,
          nombreProveedor: proveedor.nombreProveedor,
          telefono: proveedor.telefono,
          direccion: proveedor.direccion,
          correo: proveedor.correo,
          usuarioRegistro: proveedor.usuarioRegistro,
          fechaRegistro: proveedor.fechaRegistro?.split('T')[0] ?? '',
          fechaModificacion: proveedor.fechaModificacion?.split('T')[0] ?? '',
          usuarioModificacion: proveedor.usuarioModificacion ?? '',
          estaActivo: proveedor.estaActivo,
        });
      },
      error: (err) => console.error('Error cargando usuario:', err),
    });
  }

  onInputUppercase(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      target.value = target.value.toUpperCase();
    }
  }

  // Valida que solo se puedan escribir números en el campo teléfono
  validarTelefono(event: KeyboardEvent): void {
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
    Object.keys(this.formProveedor.controls).forEach((campo) => {
      const control = this.formProveedor.get(campo);
      if (control && control.invalid) {
        errores[campo] = control.errors;
      }
    });
    return errores;
  }

  guardarCambios(): void {
    if (this.formProveedor.invalid) {
      console.log('Errores del formulario:', this.obtenerErroresFormulario());
      this.notificacionService.mostrarMensajeError(
        'Formulario inválido',
        'Por favor complete correctamente el formulario.'
      );
      return;
    }

    if (this.idProveedor === null) {
      this.notificacionService.mostrarMensajeError(
        'ID inválido',
        'ID de proveedor no válido.'
      );
      return;
    }

    // Preguntar antes de guardar
    this.notificacionService
      .confirmar('Confirmación', '¿Desea actualizar este proveedor?')
      .subscribe((confirmado: boolean) => {
        if (!confirmado) return; // Si cancela, no hacemos nada

        const formValue = this.formProveedor.getRawValue();

        const proveedorEditado: ProveedorUpdate = {
          rtnProveedor: formValue.rtnProveedor,
          nombreProveedor: formValue.nombreProveedor,
          telefono: formValue.telefono,
          direccion: formValue.direccion,
          correo: formValue.correo,
          usuarioModificacion: sessionStorage.getItem('codigoUsuario') || '',
          estaActivo: formValue.estaActivo,
        };

        this.proveedorService
          .actualizarProveedor(this.idProveedor!, proveedorEditado)
          .subscribe({
            next: () => {
              if (this.estadoActivoOriginal !== formValue.estaActivo) {
                const mensaje = formValue.estaActivo
                  ? 'Proveedor activado correctamente.'
                  : 'Proveedor inactivado correctamente.';
                this.notificacionService.mostrarMensajeExito(
                  'Estado actualizado',
                  mensaje
                );
              } else {
                this.notificacionService.mostrarMensajeExito(
                  'Actualización exitosa',
                  'El proveedor ha sido actualizado correctamente.'
                );
              }
              this.dialogRef.close('actualizado');
            },
            error: (error) => {
              console.error('Error actualizando proveedor:', error);
              const mensajeBackend =
                error?.error?.message ||
                'Ocurrió un error al intentar actualizar el proveedor.';
              this.notificacionService.mostrarMensajeError(
                'Error al actualizar',
                mensajeBackend
              );
            },
          });
      });
  }
}
