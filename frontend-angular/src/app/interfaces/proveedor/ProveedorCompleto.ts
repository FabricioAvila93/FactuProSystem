export interface ProveedorCompleto {
  idProveedor?: number;
  rtnProveedor: string;
  nombreProveedor: string;
  correo: string;
  telefono: string;
  direccion: string;
  fechaRegistro: string;
  usuarioRegistro: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
  estaActivo: boolean;
}
