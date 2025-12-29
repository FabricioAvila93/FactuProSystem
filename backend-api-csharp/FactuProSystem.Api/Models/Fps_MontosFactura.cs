using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FactuProSystem.Api.Models
{
    public class Fps_MontosFactura
    {
        [Key, ForeignKey("Factura")]
        public int IdFactura { get; set; }

        public decimal? Exentas { get; set; }
        public decimal? Grav15 { get; set; }
        public decimal? Grav18 { get; set; }
        public decimal? Impuesto15 { get; set; }
        public decimal? Impuesto18 { get; set; }

        [Required]
        public decimal TotalCompra { get; set; }

        // Navegación inversa
        public virtual Fps_Facturas Factura { get; set; }
    }
}
