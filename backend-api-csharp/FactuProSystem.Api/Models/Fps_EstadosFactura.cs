using System.ComponentModel.DataAnnotations;

namespace FactuProSystem.Api.Models
{
    public class Fps_EstadosFactura
    {
        [Key]
        public int IdEstado { get; set; }

        [Required]
        [MaxLength(20)]
        public string Nombre { get; set; }

        public ICollection<Fps_Facturas> Fps_Facturas { get; set; }
    }
}
