export interface LoginResponse {
  isSuccess: boolean;
  token?: string;
  nombreCompleto?: string;
  idUsuario?: number;
  codigoUsuario?: string;
  idRol?: number;
  debeCambiarClave?: boolean;
  mensaje: string;
    requiereCambioClave?: boolean;
}
