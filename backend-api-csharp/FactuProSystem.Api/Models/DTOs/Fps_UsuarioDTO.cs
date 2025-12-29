using System.ComponentModel.DataAnnotations;

namespace FactuProSystem.Api.Models.DTOs
{
    public class Fps_UsuarioDTO
    {

        [Required]
        public string CodigoUsuario { get; set; }

        [Required]
        public string Clave { get; set; }

        [Required]
        public string Identificacion { get; set; }

        [Required]
        public string NombreCompleto { get; set; }

        public bool EsMasculino { get; set; }

        public string Direccion { get; set; }

        public string Telefono { get; set; }

        public string Correo { get; set; }

        public string UsuarioRegistro { get; set; } = "DEFAULT";


        [Required]
        public int IdRol { get; set; }

        public int? IdAgencia { get; set; }

    }
}
