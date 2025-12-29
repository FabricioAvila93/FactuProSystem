import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificacionService } from '../../../services/ui/notificacion.service';
import { Router } from '@angular/router';
import { ProveedorCaiRangoService } from '../../../services/proveedorCaiRango/proveedor-cai-rango.service';
import { ProveedorCaiRango } from '../../../interfaces/proveedorCaiRango/ProveedorCaiRango';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MY_DATE_FORMATS } from '../../../shared/calendar/date-format';


@Component({
  selector: 'app-registrar-cai-rango',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule, MatCard,MatDatepickerModule,
MatNativeDateModule,MatNativeDateModule],
  templateUrl: './registrar-cai-rango.component.html',
  styleUrl: './registrar-cai-rango.component.css',
   providers: [
      { provide: DateAdapter, useClass: NativeDateAdapter },
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
      { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    ],
})
export class RegistrarCaiRangoComponent {

  formRegistroCaiRango!: FormGroup;
   idProveedor: number | null = null;


  private fb = inject(FormBuilder);
  private proveedorCaiRangoService = inject(ProveedorCaiRangoService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<RegistrarCaiRangoComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private notificacionService = inject(NotificacionService);
  private longitudesCai = [6, 6, 6, 6, 6, 2];



ngOnInit(): void {
  this.inicializarFormulario();
  this.imprimirErroresFormulario();

  this.idProveedor = this.data.idProveedor;

  ['codigoEstablecimiento', 'puntoEmision', 'tipoDocumento', 'correlativoInicio', 'correlativoFin', 'fechaExpiracion']
    .forEach(campo => {
      this.formRegistroCaiRango.get(campo)?.valueChanges.subscribe(() => this.actualizarDocumentosFiscales());
    });



  this.formRegistroCaiRango.get('cai')?.valueChanges.subscribe((valor) => {
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
      this.formRegistroCaiRango.get('cai')?.setValue(valorFormateado, { emitEvent: false });
    }
  });

}


private inicializarFormulario(): void {
  this.formRegistroCaiRango = this.fb.group({
    cai: ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-]*$/)]],
    codigoEstablecimiento: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    puntoEmision: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    tipoDocumento: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    correlativoInicio: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    correlativoFin: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
    documentoFiscal_Inicio: ['', [Validators.pattern(/^[0-9\-]*$/)]],
    documentoFiscal_Fin: ['', [Validators.pattern(/^[0-9\-]*$/)]],
    fechaExpiracion: ['', [Validators.required]],
  });
}


crearCaiRango(): void {
  if (this.formRegistroCaiRango.invalid) {
    this.notificacionService.mostrarMensajeError(
      'Formulario inválido',
      'Por favor complete correctamente el formulario.'
    );
    this.imprimirErroresFormulario();
    return;
  }

  const formValue = this.formRegistroCaiRango.getRawValue();

  if (!formValue.documentoFiscal_Inicio || !formValue.documentoFiscal_Fin) {
    this.notificacionService.mostrarMensajeError(
      'Documentos fiscales incompletos',
      'Debe completar correctamente los campos para generar los documentos fiscales.'
    );
    return;
  }

  // Preguntar antes de crear
  this.notificacionService
    .confirmar('Confirmación', '¿Desea registrar este rango de CAI?')
    .subscribe((confirmado: boolean) => {
      if (!confirmado) return; // Si el usuario cancela, no hacemos nada

      const usuarioLogueado = localStorage.getItem('codigoUsuario') || 'ADMIN';

const nuevoRegistro: ProveedorCaiRango = {
  idProveedor: this.idProveedor ?? 0,
  cai: formValue.cai,
  tipoDocumento: formValue.tipoDocumento,
  codigoEstablecimiento: formValue.codigoEstablecimiento,
  puntoEmision: formValue.puntoEmision,
  correlativoInicio: formValue.correlativoInicio,
  correlativoFin: formValue.correlativoFin,
  documentoFiscal_Inicio: formValue.documentoFiscal_Inicio,
  documentoFiscal_Fin: formValue.documentoFiscal_Fin,
  fechaExpiracion: formValue.fechaExpiracion,
  usuarioRegistro: usuarioLogueado
};



      this.proveedorCaiRangoService.crearCaiRango(nuevoRegistro).subscribe({
        next: (resp: any) => {
          this.notificacionService.mostrarMensajeExito(
            'ÉXITO',
            resp.message || 'Rango de CAI registrado correctamente.'
          );
          this.dialogRef.close('guardado');
        },
        error: (err) => {
          if (err.status === 409) {
            this.notificacionService.mostrarMensajeError(
              'CAI DUPLICADO',
              'EL RANGO CAI YA ESTÁ ASIGNADO A OTRO PROVEEDOR.'
            );
          } else {
            this.notificacionService.mostrarMensajeError(
              'ERROR',
              'OCURRIÓ UN ERROR AL GUARDAR EL RANGO.'
            );
          }
        }
      });
  

    });
}




actualizarDocumentosFiscales(): void {
  const establecimiento = this.formRegistroCaiRango.get('codigoEstablecimiento')?.value;
  const punto = this.formRegistroCaiRango.get('puntoEmision')?.value;
  const tipo = this.formRegistroCaiRango.get('tipoDocumento')?.value;
  const correlativoInicio = this.formRegistroCaiRango.get('correlativoInicio')?.value;
  const correlativoFin = this.formRegistroCaiRango.get('correlativoFin')?.value;
  const fechaExpiracion = this.formRegistroCaiRango.get('fechaExpiracion')?.value;

  const todosLlenos = establecimiento && punto && tipo && correlativoInicio && correlativoFin;

  if (todosLlenos) {
    const docInicio = `${establecimiento}-${punto}-${tipo}-${correlativoInicio}`;
    const docFin = `${establecimiento}-${punto}-${tipo}-${correlativoFin}`;

    this.formRegistroCaiRango.get('documentoFiscal_Inicio')?.setValue(docInicio);
    this.formRegistroCaiRango.get('documentoFiscal_Fin')?.setValue(docFin);
  } else {
    this.formRegistroCaiRango.get('documentoFiscal_Inicio')?.setValue('');
    this.formRegistroCaiRango.get('documentoFiscal_Fin')?.setValue('');
  }
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


 cancelar(): void {
      this.dialogRef.close();
  }



imprimirErroresFormulario(): void {
  console.log('¿Formulario válido?', this.formRegistroCaiRango.valid);
  Object.keys(this.formRegistroCaiRango.controls).forEach(key => {
    const controlErrors = this.formRegistroCaiRango.get(key)?.errors;
    if (controlErrors != null) {
      console.log(`Errores en el campo "${key}":`, controlErrors);
    }
  });
}

  // Valida que solo se puedan escribir números en el campo identificación
 validarSoloNumeros(event: KeyboardEvent): void {
  const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
  if (allowedKeys.includes(event.key)) return;

  const pattern = /[0-9]/;
  if (!pattern.test(event.key)) {
    event.preventDefault();
  }
}


 // Convierte a mayúsculas la entrada de ciertos campos (excepto clave y teléfono)
  onInputUppercase(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
  }


moverFocus(event: Event, siguienteInput: HTMLInputElement | null) {
  const input = event.target as HTMLInputElement;
  if (input.value.length >= input.maxLength) {
    siguienteInput?.focus();
  }
}






}
