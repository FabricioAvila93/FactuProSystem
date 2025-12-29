export interface FacturaEvaluacion {
  idFactura: number;        // ID de la factura que se va a evaluar
  idEstado: number;         // Estado de la factura: 10 = Aceptada, 11 = Rechazada
  comentarioAdmin?: string; // Solo se llena si es rechazada
  fechaEvaluacion: string;  // Fecha de la evaluación en formato ISO
  fechaContable?: string;   // Solo se llena si es aprobada
  codigoUsuario: string;    // Código del usuario que realiza la evaluación
}
