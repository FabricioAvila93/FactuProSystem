import { Component, inject, OnInit } from '@angular/core';
import { Agencias } from '../../../interfaces/agencias/Agencia';
import { AgenciasService } from '../../../services/agencias/agencias.service';
import { RolesService } from '../../../services/roles/roles.service';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCard } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Roles } from '../../../interfaces/roles/Roles';
import { NotificacionService } from '../../../services/ui/notificacion.service';

@Component({
  selector: 'app-registrar-usuario',
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
  templateUrl: './registrar-usuario.component.html',
  styleUrls: ['./registrar-usuario.component.css'],
})
export class RegistrarUsuarioComponent implements OnInit {
  formRegistro!: FormGroup;
  agencias: Agencias[] = [];
  roles: Roles[] = [];

  private fb = inject(FormBuilder);
  private agenciasService = inject(AgenciasService);
  private rolesService = inject(RolesService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<RegistrarUsuarioComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private notificacionService = inject(NotificacionService);

  ngOnInit(): void {
    this.cargarAgencias();
    this, this.cargarRoles();
    this.inicializarFormulario();
    this.imprimirErroresFormulario();
  }

  /*
private inicializarFormulario(): void {
  this.formRegistro = this.fb.group({
    codigoUsuario: ['', Validators.required],
    clave: [null],
    identificacion: ['', [Validators.required, Validators.pattern(/^[0-9\-]*$/)]],
    nombreCompleto: ['', Validators.required],
    esMasculino: [true, Validators.required],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    direccion: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    idRol: [null, Validators.required],
    idAgencia: [null, Validators.required]
  });
}*/

  private cargarAgencias(): void {
    this.agenciasService.cargarAgencias().subscribe({
      next: (data) => {
        this.agencias = data;
      },
      error: (err) => console.error('Error cargando agencias:', err),
    });
  }

  private cargarRoles(): void {
    this.rolesService.cargarRoles().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => console.error('Error cargando roles:', err),
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

  crearUsuario(): void {
    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched();
      return;
    }

    // Preguntar antes de guardar
    this.notificacionService
      .confirmar('Confirmación', '¿Desea registrar este usuario?')
      .subscribe((confirmado: boolean) => {
        if (!confirmado) return;

        const {
          codigoUsuario,
          clave,
          identificacion,
          nombreCompleto,
          esMasculino,
          telefono,
          direccion,
          correo,
          idRol,
          idAgencia,
        } = this.formRegistro.value;

        const usuario = {
          codigoUsuario: codigoUsuario.toUpperCase(),
          clave: codigoUsuario.toUpperCase(),
          identificacion: identificacion.toUpperCase(),
          nombreCompleto: nombreCompleto.toUpperCase(),
          esMasculino,
          telefono,
          direccion: direccion.toUpperCase(),
          correo,
          idRol,
          idAgencia,
        };

        this.usuariosService.crearUsuario(usuario).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.notificacionService.mostrarMensajeExito(
                'Usuario registrado exitosamente'
              );
              this.formRegistro.reset();
              this.dialogRef.close('guardado');
            } else {
              this.procesarErrores({ error: res });
            }
          },
          error: (err) => {
            this.procesarErrores(err);
          },
        });
      });
  }

  private inicializarFormulario(): void {
    this.formRegistro = this.fb.group({
      codigoUsuario: ['', Validators.required],
      clave: [null],
      identificacion: [
        '',
        [Validators.required, Validators.pattern(/^[0-9\-]*$/)],
      ],
      nombreCompleto: ['', Validators.required],
      esMasculino: [true, Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      direccion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      idRol: [null, Validators.required],
      idAgencia: [null, Validators.required],
    });

    // Suscribir al cambio de identificacion para formatear
    this.formRegistro.get('identificacion')?.valueChanges.subscribe((value) => {
      if (!value) return;

      const formateado = this.formatearIdentificacion(value);

      // Solo actualizar si el valor realmente cambió para evitar loops
      if (formateado !== value) {
        this.formRegistro
          .get('identificacion')
          ?.setValue(formateado, { emitEvent: false });
      }
    });
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
    this.formRegistro
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
    console.log('¿Formulario válido?', this.formRegistro.valid);
    Object.keys(this.formRegistro.controls).forEach((key) => {
      const controlErrors = this.formRegistro.get(key)?.errors;
      if (controlErrors != null) {
        console.log(`Errores en el campo "${key}":`, controlErrors);
      }
    });
  }
}
