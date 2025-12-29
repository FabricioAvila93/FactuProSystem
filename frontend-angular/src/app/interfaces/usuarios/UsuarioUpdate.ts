export interface UsuarioUpdate {
  codigoUsuario?: string;
  identificacion?: string;
  nombreCompleto?: string;
  esMasculino?:boolean;
  telefono?: string;
  direccion?: string;
  correo?: string;
  idRol: number;
  idAgencia?: number | null;
  activo?: boolean;
  usuarioModificacion?: string;
  estaActivo?: boolean;
}
