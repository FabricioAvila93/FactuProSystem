using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FactuProSystem.Api.Models
{
    public class Fps_Usuarios
    {
        [Key]
        public int IdUsuario { get; set; }

        [Required]
        [MaxLength(50)]
        public string CodigoUsuario { get; set; }

        [Required]
        [MaxLength(200)]
        public string Clave { get; set; }

        [Required]
        [MaxLength(20)]
        public string Identificacion { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreCompleto { get; set; }

        public bool EsMasculino { get; set; }

        [MaxLength(200)]
        public string Direccion { get; set; }

        [MaxLength(20)]
        public string Telefono { get; set; }


        [MaxLength(100)]
        public string Correo { get; set; }

        public int IdRol { get; set; }

        public int? IdAgencia { get; set; }

        public DateTime FechaRegistro { get; set; }

        [MaxLength(50)]
        public string? UsuarioRegistro { get; set; }

        public DateTime? FechaModificacion { get; set; }

        [MaxLength(50)]
        public string? UsuarioModificacion { get; set; }

        public bool EstaActivo { get; set; }

        // 🔗 Relaciones
        [ForeignKey("IdRol")]
        public Fps_Roles Roles { get; set; }

        [ForeignKey("IdAgencia")]
        public Fps_Agencias Agencias { get; set; }
    }
}
