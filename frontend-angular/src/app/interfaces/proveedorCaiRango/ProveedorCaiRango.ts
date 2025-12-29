export interface ProveedorCaiRango {
  idCaiRango?: number;
  idProveedor: number;
  nombreProveedor?: string;

  cai: string;

  codigoEstablecimiento: string;
  puntoEmision: string;
  tipoDocumento: string;

  correlativoInicio: string;
  correlativoFin: string;

  documentoFiscal_Inicio?: string;
  documentoFiscal_Fin?: string;

  fechaRegistro?: string;
  fechaModificacion?: string;
  usuarioRegistro?: string;
  usuarioModificacion?: string;
  fechaExpiracion?: string;
  estaActivo?: boolean;
}
