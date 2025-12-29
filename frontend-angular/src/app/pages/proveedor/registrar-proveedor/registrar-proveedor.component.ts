import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProveedorService } from '../../../services/proveedor/proveedor.service';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificacionService } from '../../../services/ui/notificacion.service';

@Component({
  selector: 'app-registrar-proveedor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCard,
  ],
  templateUrl: './registrar-proveedor.component.html',
  styleUrls: ['./registrar-proveedor.component.css'],
})
export class RegistrarProveedorComponent {
  formRegistroProveedor!: FormGroup;

  private fb = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<RegistrarProveedorComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private notificacionService = inject(NotificacionService);

  ngOnInit(): void {
    this.inicializarFormulario();
    this.imprimirErroresFormulario();
  }

  private inicializarFormulario(): void {
    this.formRegistroProveedor = this.fb.group({
      rtnProveedor: [
        '',
        [Validators.required, Validators.pattern(/^[0-9\-]*$/)],
      ],
      nombreProveedor: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      direccion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  crearProveedor(): void {
    if (this.formRegistroProveedor.invalid) {
      this.formRegistroProveedor.markAllAsTouched();
      this.notificacionService.mostrarMensajeError(
        'Campos incompletos',
        'Por favor completa todos los campos correctamente.'
      );
      return;
    }

    // Preguntar antes de guardar
    this.notificacionService
      .confirmar('Confirmación', '¿Desea registrar este proveedor?')
      .subscribe((confirmado: boolean) => {
        if (!confirmado) return; // Si cancela, no hacemos nada

        const { rtnProveedor, nombreProveedor, telefono, direccion, correo } =
          this.formRegistroProveedor.value;

        const usuarioLogueado =
          localStorage.getItem('codigoUsuario') || 'ADMIN';

        const proveedor = {
          rtnProveedor: rtnProveedor.toUpperCase(),
          nombreProveedor: nombreProveedor.toUpperCase(),
          telefono: telefono,
          direccion: direccion.toUpperCase(),
          correo,
          usuarioRegistro: usuarioLogueado, // <-- usuario que registra
        };
        this.proveedorService.crearProveedor(proveedor).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.notificacionService.mostrarMensajeExito(
                'Proveedor registrado exitosamente'
              );
              this.formRegistroProveedor.reset();
              this.dialogRef.close('guardado');
            } else {
              this.procesarErrores({ error: res }); // Procesar errores del backend
            }
          },
          error: (err) => {
            this.procesarErrores(err); // Procesar errores HTTP o inesperados
          },
        });
      });
  }

  procesarErrores(error: any): void {
    const errorResponse = error?.error;

    // 2. Mensaje general enviado desde backend
    const mensajeGeneral = errorResponse?.message;
    if (mensajeGeneral) {
      this.notificacionService.mostrarMensajeError('Error', mensajeGeneral);
      return;
    }

    // 3. Otros errores no controlados
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

  // Formatea la identificación agregando guiones automáticamente
  formatearIdentificacion(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Eliminar todo lo que no sea número
    value = value.replace(/\D/g, '');

    // Formatear con guiones: 4 números - 4 números - hasta 5 números
    if (value.length > 8) {
      value =
        value.slice(0, 4) + '-' + value.slice(4, 8) + '-' + value.slice(8, 13);
    } else if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4);
    }

    input.value = value;

    // Actualizar el formulario
    this.formRegistroProveedor
      .get('identificacion')
      ?.setValue(value, { emitEvent: false });
  }

  // Convierte a mayúsculas la entrada de ciertos campos (excepto clave y teléfono)
  onInputUppercase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
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

  imprimirErroresFormulario(): void {
    console.log('¿Formulario válido?', this.formRegistroProveedor.valid);
    Object.keys(this.formRegistroProveedor.controls).forEach((key) => {
      const controlErrors = this.formRegistroProveedor.get(key)?.errors;
      if (controlErrors != null) {
        console.log(`Errores en el campo "${key}":`, controlErrors);
      }
    });
  }
}
