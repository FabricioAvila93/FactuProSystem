using System.ComponentModel.DataAnnotations;

namespace FactuProSystem.Api.Models
{
    public class Fps_Agencias
    {
        [Key]
        public int IdAgencia { get; set; }

        [Required]
        [MaxLength(10)]
        public string CodigoAgencia { get; set; }

        [Required]
        [MaxLength(100)]
        public string NombreAgencia { get; set; }

        public bool EstaActivo { get; set; }


    }
}
