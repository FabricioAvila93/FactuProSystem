export interface UsuarioRegistro {
  codigoUsuario: string;
  clave: string;
  identificacion: string;
  nombreCompleto: string;
  esMasculino: boolean;
  direccion?: string;
  telefono?: string;
  correo?: string;
  idRol: number;
  idAgencia?: number;
  usuarioRegistro?: string;
}
