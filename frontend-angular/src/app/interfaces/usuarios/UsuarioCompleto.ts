export interface UsuarioCompleto {
  idUsuario: number;
  codigoUsuario: string;
  identificacion: string;
  nombreCompleto: string;
  telefono: string;
  direccion: string;
  correo: string;
  idRol: number;
  nombreRol: string;      
  nombreAgencia: string;
  idAgencia: number;
  fechaRegistro: string;
  usuarioRegistro: string;
  fechaModificacion?: string;
  usuarioModificacion?: string;
  estaActivo: boolean;
  esMasculino: boolean;
}
