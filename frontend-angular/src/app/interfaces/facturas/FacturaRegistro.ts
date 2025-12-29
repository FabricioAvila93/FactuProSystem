export interface FacturaRegistro {
  fecha: string;
  establecimiento: string;
  puntoEmision: string;
  tipoDocumento: string;
  correlativo: string;
  cai: string;
  idUsuario: number;
  idDocumento: number;
  numeroDocumentoRecibo: string;
  kilometrajeRecorrido?: number;
  esGasolina: boolean;
  exentas: number;
  grav15: number;
  grav18: number;
  impuesto15: number;
  impuesto18: number;
  totalCompra: number;
  estaActivo?: boolean;
  fechaRegistro?: string; // Aunque lo pone el backend, se espera el campo
  usuarioRegistro?: string; // igual
  fechaModificacion?: string;
  usuarioModificacion?: string;
  idEstado?: number;
  comentarioAdmin?: string;
  fechaContable?: string;
  idProveedor: number;
  rtnProveedor: string;
  nombreProveedor: string;
}
