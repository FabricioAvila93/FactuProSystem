import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Login } from '../../../interfaces/login/Login';
import { LoginService } from '../../../services/login/login.service';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCard,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private loginService = inject(LoginService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private notificacionService = inject(NotificacionService);

  public formLogin: FormGroup = this.formBuilder.group({
    codigoUsuario: ['', Validators.required],
    clave: ['', Validators.required],
  });

  iniciarSesion() {
    if (this.formLogin.invalid) {
      this.notificacionService.mostrarMensajeError(
        'Formulario incompleto',
        'Por favor completa todos los campos.'
      );
      return;
    }

    const objeto: Login = {
      codigoUsuario: this.formLogin.value.codigoUsuario?.toUpperCase(),
      clave: this.formLogin.value.clave,
    };

    // Mostrar spinner de carga
    Swal.fire({
      title: 'Iniciando sesión...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.loginService.login(objeto).subscribe({
      next: (data) => {
        Swal.close(); // Cerrar spinner

        if (
          data.isSuccess &&
          data.token &&
          data.nombreCompleto &&
          data.idUsuario !== undefined &&
          data.idRol !== undefined &&
          data.codigoUsuario
        ) {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('nombreUsuario', data.nombreCompleto);
          sessionStorage.setItem('idUsuario', data.idUsuario.toString());
          sessionStorage.setItem('idRol', data.idRol.toString());
          sessionStorage.setItem(
            'codigoUsuario',
            data.codigoUsuario.toUpperCase()
          );
          sessionStorage.setItem('expira', Date.now().toString());

          if (data.debeCambiarClave) {
            this.notificacionService.mostrarMensajeExito(
              'Cambio de contraseña requerido',
              'Debes cambiar tu contraseña antes de continuar.'
            );
            this.router.navigate(['reseteo-contrasena'], {
              queryParams: { codigoUsuario: data.codigoUsuario },
            });
          } else {
            this.notificacionService.mostrarMensajeExito(
              'Inicio de sesión exitoso',
              '¡Bienvenido al sistema!'
            );
            this.router.navigate(['home']);
          }
        } else {
          this.notificacionService.mostrarMensajeError(
            'Error en el servidor',
            'Respuesta incompleta del servidor.'
          );
        }
      },
      error: (error) => {
        console.error('Error en Login:', error);
        Swal.close(); // Cerrar spinner
        this.notificacionService.mostrarMensajeError(
          'Error de autenticación',
          'Credenciales incorrectas o problema de conexión.'
        );
      },
    });
  }
}
