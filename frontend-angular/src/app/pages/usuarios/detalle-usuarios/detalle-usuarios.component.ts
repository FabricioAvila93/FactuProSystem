import { Component, inject } from '@angular/core';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { RolesService } from '../../../services/roles/roles.service';
import { AgenciasService } from '../../../services/agencias/agencias.service';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { UsuarioUpdate } from '../../../interfaces/usuarios/UsuarioUpdate';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSelect } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCard } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { UsuarioCompleto } from '../../../interfaces/usuarios/UsuarioCompleto';

@Component({
  selector: 'app-detalle-usuarios',
  standalone: true,
  imports: [
    MatCheckbox,
    MatSelect,
    MatOptionModule,
    MatCard,
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
  ],
  templateUrl: './detalle-usuarios.component.html',
  styleUrl: './detalle-usuarios.component.css',
})
export class DetalleUsuariosComponent {
  formUsuario!: FormGroup;
  idUsuario: number | null = null;
  modo: 'ver' | 'editar' = 'ver';
  roles: { id: number; nombre: string }[] = [];
  agencias: { id: number; nombre: string }[] = [];
  esNuevo: boolean = true;
  estadoActivoOriginal: boolean = false;

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuariosService);
  private rolService = inject(RolesService);
  private agenciaService = inject(AgenciasService);
  private dialogRef = inject(MatDialogRef<DetalleUsuariosComponent>);
  private data = inject(MAT_DIALOG_DATA) as {
    idUsuario: number;
    modo: 'ver' | 'editar';
  };
  private notificacionService = inject(NotificacionService);

  constructor() {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.idUsuario = this.data.idUsuario;
    this.modo = this.data.modo;

    this.esNuevo = !this.idUsuario;

    if (this.modo === 'ver') {
      this.formUsuario.disable();
    } else {
      this.formUsuario.enable();
      this.formUsuario.get('fechaRegistro')?.disable();
      this.formUsuario.get('usuarioRegistro')?.disable();
      this.formUsuario.get('fechaModificacion')?.disable();
      this.formUsuario.get('usuarioModificacion')?.disable();
    }

    forkJoin({
      roles: this.rolService.cargarRoles(),
      agencias: this.agenciaService.cargarAgencias(),
    }).subscribe({
      next: ({ roles, agencias }) => {
        this.roles = roles;
        this.agencias = agencias;

        if (this.idUsuario) {
          this.cargarDatosUsuario(this.idUsuario);
        }
      },
      error: (err) => console.error('Error cargando roles o agencias:', err),
    });
  }

  private inicializarFormulario(): void {
    this.formUsuario = this.fb.group({
      codigoUsuario: ['', Validators.required],
      identificacion: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      esMasculino: [null, Validators.required],
      telefono: [''],
      direccion: [''],
      correo: ['', [Validators.email]],
      idRol: [null, Validators.required],
      idAgencia: [null],
      usuarioRegistro: [{ value: '', disabled: true }],
      fechaRegistro: [{ value: '', disabled: true }],
      fechaModificacion: [{ value: '', disabled: true }],
      usuarioModificacion: [{ value: '', disabled: true }],
      estaActivo: [false, Validators.required],
    });
  }

  private cargarDatosUsuario(id: number): void {
    this.usuarioService.obtenerUsuarioDetalle(id).subscribe({
      next: (usuario) => {
        this.estadoActivoOriginal = usuario.estaActivo;

        this.formUsuario.patchValue({
          codigoUsuario: usuario.codigoUsuario,
          identificacion: usuario.identificacion,
          nombreCompleto: usuario.nombreCompleto,
          esMasculino: usuario.esMasculino,
          telefono: usuario.telefono,
          direccion: usuario.direccion,
          correo: usuario.correo,
          idRol: usuario.idRol,
          idAgencia: usuario.idAgencia,
          usuarioRegistro: usuario.usuarioRegistro,
          fechaRegistro: usuario.fechaRegistro?.split('T')[0] ?? '',
          fechaModificacion: usuario.fechaModificacion?.split('T')[0] ?? '',
          usuarioModificacion: usuario.usuarioModificacion ?? '',
          estaActivo: usuario.estaActivo,
        });
      },
      error: (err) => console.error('Error cargando usuario:', err),
    });
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

  guardarCambios(): void {
    if (this.formUsuario.invalid) {
      this.notificacionService.mostrarMensajeError(
        'Formulario inválido',
        'Por favor complete correctamente el formulario.'
      );
      return;
    }

    if (this.idUsuario === null) {
      this.notificacionService.mostrarMensajeError(
        'ID inválido',
        'ID de usuario no válido.'
      );
      return;
    }

    this.notificacionService
      .confirmar('Confirmación', '¿Desea guardar los cambios en este usuario?')
      .subscribe((confirmado: boolean) => {
        if (!confirmado) return;

        const formValue = this.formUsuario.getRawValue();

        const usuarioEditado: UsuarioUpdate = {
          codigoUsuario: formValue.codigoUsuario,
          identificacion: formValue.identificacion,
          nombreCompleto: formValue.nombreCompleto,
          esMasculino: formValue.esMasculino,
          telefono: formValue.telefono,
          direccion: formValue.direccion,
          correo: formValue.correo,
          idRol: Number(formValue.idRol),
          idAgencia: Number(formValue.idAgencia),
          usuarioModificacion: sessionStorage.getItem('codigoUsuario') || '',
          estaActivo: formValue.estaActivo,
        };

        this.usuarioService
          .actualizarUsuario(this.idUsuario!, usuarioEditado)
          .subscribe({
            next: () => {
              if (this.estadoActivoOriginal !== formValue.estaActivo) {
                const mensaje = formValue.estaActivo
                  ? 'Usuario activado correctamente.'
                  : 'Usuario inactivado correctamente.';
                this.notificacionService.mostrarMensajeExito(
                  'Estado actualizado',
                  mensaje
                );
              } else {
                this.notificacionService.mostrarMensajeExito(
                  'Actualización exitosa',
                  'El usuario ha sido actualizado correctamente.'
                );
              }
              this.dialogRef.close('actualizado');
            },
            error: (error) => {
              console.error('Error actualizando usuario:', error);
              const mensajeBackend =
                error?.error?.message ||
                'Ocurrió un error al intentar actualizar el usuario.';
              this.notificacionService.mostrarMensajeError(
                'Error al actualizar',
                mensajeBackend
              );
            },
          });
      });
  }

  onInputUppercase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
