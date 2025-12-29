using System.ComponentModel.DataAnnotations;

namespace FactuProSystem.Api.Models
{
    public class Fps_Roles
    {
        [Key]
        public int IdRol { get; set; }

        [Required]
        [MaxLength(5)]
        public string CodigoRol { get; set; }

        [Required]
        [MaxLength(20)]
        public string NombreRol { get; set; }

        public bool EstaActivo { get; set; }
    }
}
