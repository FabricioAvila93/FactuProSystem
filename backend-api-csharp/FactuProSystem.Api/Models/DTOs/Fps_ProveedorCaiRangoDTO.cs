namespace FactuProSystem.Api.Models.DTOs
{
    public class Fps_ProveedorCaiRangoDTO
    {
        public int IdRangoCAI { get; set; }
        public int IdProveedor { get; set; }
        public string CAI { get; set; }
        public string CodigoEstablecimiento { get; set; }
        public string PuntoEmision { get; set; }
        public string TipoDocumento { get; set; }
        public string CorrelativoInicio { get; set; }
        public string CorrelativoFin { get; set; }
        public string DocumentoFiscal_Inicio { get; set; }
        public string DocumentoFiscal_Fin { get; set; }
        public DateTime FechaRegistro { get; set; }
        public string? UsuarioRegistro { get; set; }
        public string? UsuarioModificacion { get; set; }
        public DateTime? FechaExpiracion { get; set; }
        public bool EstaActivo { get; set; }
    }
}
