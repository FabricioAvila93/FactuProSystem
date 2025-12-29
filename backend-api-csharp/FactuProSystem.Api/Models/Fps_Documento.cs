using System.ComponentModel.DataAnnotations;

namespace FactuProSystem.Api.Models
{
    public class Fps_Documento
    {
        [Key]
        public int IdDocumento { get; set; }

        [Required]
        [MaxLength(10)]
        public string Codigo { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; }
    }
}

