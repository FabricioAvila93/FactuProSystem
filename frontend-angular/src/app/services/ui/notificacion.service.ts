// notificacion.service.ts
import { Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  mostrarMensajeExito(
    titulo: string,
    mensaje: string = '',
    confirmText: string = 'OK'
  ): void {
    Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonText: confirmText,
      confirmButtonColor: '#7a5ef8',
    });
  }

  mostrarMensajeError(
    titulo: string,
    mensaje: string = '',
    confirmText: string = 'OK'
  ): void {
    Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      confirmButtonText: confirmText,
      confirmButtonColor: '#f44336',
    });
  }

  confirmar(
    titulo: string,
    mensaje: string = '',
    confirmText: string = 'Sí',
    cancelText: string = 'No'
  ): Observable<boolean> {
    return from(
      Swal.fire({
        title: titulo,
        text: mensaje,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: '#1976d2',
        cancelButtonColor: '#f44336',
      }).then((result) => result.isConfirmed)
    );
  }
}
