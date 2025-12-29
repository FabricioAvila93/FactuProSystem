namespace FactuProSystem.Api.Models.DTOs
{
    public class Fps_FacturaEvaluacionDTO
    {
        public int IdFactura { get; set; }
        public int IdEstado { get; set; }
        public string? ComentarioAdmin { get; set; }
        public DateTime FechaEvaluacion { get; set; } = DateTime.Now;
        public DateTime? FechaContable { get; set; }
        public string? CodigoUsuario { get; set; }
    }
}
