using System.ComponentModel.DataAnnotations;

namespace FactuProSystem.Api.Models
{
    public class Fps_Proveedor
    {
        [Key]
        public int IdProveedor { get; set; }

        [Required]
        [MaxLength(20)]
        public string RTNProveedor { get; set; } 

        [Required]
        [MaxLength(100)]
        public string NombreProveedor { get; set; }
        public bool EstaActivo { get; set; } = true;

        [MaxLength(255)]
        public string? Direccion { get; set; }

        [MaxLength(100)]
        public string? Correo { get; set; }

        [MaxLength(20)]
        public string? Telefono { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        [MaxLength(50)]
        public string? UsuarioRegistro { get; set; }

        public DateTime? FechaModificacion { get; set; }

        [MaxLength(50)]
        public string? UsuarioModificacion { get; set; }

        
    }

}

