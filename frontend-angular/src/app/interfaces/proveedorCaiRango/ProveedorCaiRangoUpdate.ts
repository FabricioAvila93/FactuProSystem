export interface ProveedorCaiRangoUpdate{
  idRangoCAI: number;
  cai: string;
  codigoEstablecimiento: string;
  puntoEmision: string;
  tipoDocumento: string;
  correlativoInicio: string;
  correlativoFin: string;
  documentoFiscal_Inicio?: string;
  documentoFiscal_Fin?: string;

  fechaModificacion?: string;
  usuarioModificacion?: string;
fechaExpiracion?: string;
  estaActivo: boolean;
}
