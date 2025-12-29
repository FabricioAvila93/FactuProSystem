namespace FactuProSystem.Api.Models.DTOs
{
    public class Fps_ProveedorDetalleDTO
    {
        public int IdProveedor { get; set; }
        public string RTNProveedor { get; set; }
        public string NombreProveedor { get; set; }
        public string? Correo { get; set; }
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
        public bool EstaActivo { get; set; }
        public DateTime FechaRegistro { get; set; }
        public string? UsuarioRegistro { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public string? UsuarioModificacion { get; set; }
    }
}
