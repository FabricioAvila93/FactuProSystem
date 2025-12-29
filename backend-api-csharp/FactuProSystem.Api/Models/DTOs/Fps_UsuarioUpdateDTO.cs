using System.ComponentModel.DataAnnotations;

namespace FactuProSystem.Api.Models.DTOs
{
    public class Fps_UsuarioUpdateDTO
    {

        [Required]
        [MaxLength(50)]
        public string CodigoUsuario { get; set; }

        [Required]
        [MaxLength(20)]
        public string Identificacion { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreCompleto { get; set; }
        public bool EsMasculino { get; set; }

        [MaxLength(20)]
        public string Telefono { get; set; }

        [MaxLength(200)]
        public string Direccion { get; set; }

        [MaxLength(100)]
        [EmailAddress]
        public string Correo { get; set; }

        [Required]
        public int IdRol { get; set; }

        public int? IdAgencia { get; set; }

        [Required]
        public bool EstaActivo { get; set; }

        [MaxLength(50)]
        public string UsuarioModificacion { get; set; } 
    }


}
