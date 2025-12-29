namespace FactuProSystem.Api.Models.DTOs
{
    public class Fps_FacturaResumenDTO
    {
        public int IdFactura { get; set; }
        public DateTime Fecha { get; set; }
        public string CodigoUsuario { get; set; }
        public bool EstaActivo { get; set; }
        public int IdEstado { get; set; }
        public string NombreEstado { get; set; }

        public string? ComentarioAdmin { get; set; }
        public DateTime? FechaContable { get; set; }
        public DateTime? FechaEvaluacion { get; set; }

        public string NombreProveedor { get; set; }
        public string RTNProveedor { get; set; }
    }
}
