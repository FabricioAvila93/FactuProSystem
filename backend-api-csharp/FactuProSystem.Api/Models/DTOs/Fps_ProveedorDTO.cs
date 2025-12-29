namespace FactuProSystem.Api.Models.DTOs
{
    public class Fps_ProveedorDTO
    {
        public int? IdProveedor { get; set; }
        public string NombreProveedor { get; set; }
        public string RTNProveedor { get; set; }
        public string Correo { get; set; }
        public string Telefono { get; set; }
        public string Direccion { get; set; }
        public bool EstaActivo { get; set; }

        public string? UsuarioRegistro { get; set; } = "DEFAULT";
        public string? UsuarioModificacion { get; set; }

    }
}
