import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from '../../../services/login/login.service';
import { Router } from '@angular/router';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-reseteo-contrasena',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIcon,
  ],
  templateUrl: './reseteo-contrasena.component.html',
  styleUrls: ['./reseteo-contrasena.component.css'],
})
export class ReseteoContrasenaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private notificacionService = inject(NotificacionService);
  hidePassword = true;
  hideConfirmPassword = true;

  formResetPassword!: FormGroup;

  ngOnInit(): void {
    this.formResetPassword = this.fb.group(
      {
        codigoUsuario: [{ value: '', disabled: true }],
        nuevaClave: ['', [Validators.required, Validators.minLength(6)]],
        confirmarClave: ['', Validators.required],
      },
      { validators: this.clavesIguales }
    );

    this.route.queryParams.subscribe((params) => {
      const codigoUsuario = params['codigoUsuario'];
      if (codigoUsuario) {
        this.formResetPassword.get('codigoUsuario')?.setValue(codigoUsuario);
      }
    });
  }

  clavesIguales(group: AbstractControl) {
    const pass = group.get('nuevaClave')?.value;
    const confirmPass = group.get('confirmarClave')?.value;
    return pass === confirmPass ? null : { noCoinciden: true };
  }

  guardarCambios() {
    if (this.formResetPassword.invalid) {
      this.formResetPassword.markAllAsTouched();
      return;
    }

    const datos = {
      codigoUsuario: this.formResetPassword.get('codigoUsuario')?.value,
      nuevaClave: this.formResetPassword.get('nuevaClave')?.value,
    };

    this.loginService.cambiarClave(datos).subscribe({
      next: () => {
        this.notificacionService.mostrarMensajeExito(
          'Contraseña cambiada',
          'Contraseña cambiada con éxito. Ahora puedes iniciar sesión.'
        );
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cambiar contraseña:', err);
        this.notificacionService.mostrarMensajeError(
          'Error',
          'No se pudo cambiar la contraseña. Intenta nuevamente.'
        );
      },
    });
  }

  // Helper para mostrar mensaje de coincidencia
  get contrasenasCoinciden(): boolean | null {
    if (
      !this.formResetPassword.get('nuevaClave')?.value &&
      !this.formResetPassword.get('confirmarClave')?.value
    ) {
      return null;
    }
    return !this.formResetPassword.hasError('noCoinciden');
  }

  cancelar(): void {
    this.router.navigate(['/login']);
  }
}
