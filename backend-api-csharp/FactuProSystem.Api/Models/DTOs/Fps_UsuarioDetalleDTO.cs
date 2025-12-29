namespace FactuProSystem.Api.Models.DTOs
{
    public class Fps_UsuarioDetalleDTO
    {
        public int IdUsuario { get; set; }
        public string CodigoUsuario { get; set; }
        public string Identificacion { get; set; }
        public string NombreCompleto { get; set; }
        public bool EsMasculino { get; set; }
        public string Direccion { get; set; }
        public string Telefono { get; set; }
        public string Correo { get; set; }
        public int IdRol { get; set; }
        public string NombreRol { get; set; }
        public int? IdAgencia { get; set; }
        public string NombreAgencia { get; set; }
        public DateTime FechaRegistro { get; set; }
        public string? UsuarioRegistro { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public string? UsuarioModificacion { get; set; }
        public bool EstaActivo { get; set; }
    }
}
