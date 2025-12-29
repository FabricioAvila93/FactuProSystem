export interface FacturaResumen {
  idFactura: number;
  nombreProveedor: string;
  fecha: string;
  codigoUsuario: string;
  estaActivo?: boolean;
  nombreEstado?: string;
  idEstado?: number;
  comentarioAdmin?: string;
  fechaContable?: string;
  rtnProveedor: string;
}
