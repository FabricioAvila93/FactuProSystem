export interface FacturaCompleta {
  fecha: string; // DateTime → string (ISO 8601, ej: '2025-08-07T12:00:00')
  establecimiento: string;
  puntoEmision: string;
  tipoDocumento: string;
  correlativo: string;
  cai: string;
  idUsuario: number;
  idDocumento: number;

  exentas: number;
  grav15: number;
  grav18: number;
  impuesto15: number;
  impuesto18: number;
  totalCompra: number;
  estaActivo: boolean; // default true en backend
  fechaRegistro: string;
  usuarioRegistro?: string | null;
  fechaModificacion?: string | null;
  usuarioModificacion?: string | null;
  numeroDocumentoRecibo: string;
  kilometrajeRecorrido?: number | null;
  esGasolina: boolean;
  idEstado?: number;
  comentarioAdmin?: string | null;
  fechaContable?: string | null;
  idProveedor: number;
  rtnProveedor: string;
  nombreProveedor: string;
}
