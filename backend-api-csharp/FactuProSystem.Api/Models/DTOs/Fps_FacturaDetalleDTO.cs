namespace FactuProSystem.Api.Models.DTOs
{
    public class Fps_FacturaDetalleDTO
    {

        public int IdFactura { get; set; }
        public DateTime Fecha { get; set; }
        public string? Establecimiento { get; set; }
        public string? PuntoEmision { get; set; }
        public string? TipoDocumento { get; set; }
        public string? Correlativo { get; set; }
        public string? CAI { get; set; }

        public string? NumeroDocumentoRecibo { get; set; }
        public decimal? KilometrajeRecorrido { get; set; }
        public bool EsGasolina { get; set; }

        public string? ComentarioAdmin { get; set; }
        public DateTime? FechaContable { get; set; }

        public int IdDocumento { get; set; }
        public int IdUsuario { get; set; }
        public int? IdEstado { get; set; }
        public int IdProveedor { get; set; }

        public string? RTNProveedor { get; set; }
        public string? NombreProveedor { get; set; }

        public decimal? Exentas { get; set; }
        public decimal? Grav15 { get; set; }
        public decimal? Grav18 { get; set; }
        public decimal? Impuesto15 { get; set; }
        public decimal? Impuesto18 { get; set; }
        public decimal TotalCompra { get; set; }

        public string? UsuarioRegistro { get; set; }
        public DateTime? FechaRegistro { get; set; }
        public string? UsuarioModificacion { get; set; }
        public DateTime? FechaModificacion { get; set; }

        public bool EstaActivo { get; set; }
    }
}
