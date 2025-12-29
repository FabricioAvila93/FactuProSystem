export interface ProveedorUpdate{
  rtnProveedor: string;
  nombreProveedor: string;
  correo: string;
  telefono: string;
  direccion: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
  estaActivo: boolean;
}
