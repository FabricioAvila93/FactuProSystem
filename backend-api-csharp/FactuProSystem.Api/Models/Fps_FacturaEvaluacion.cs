using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FactuProSystem.Api.Models
{
    public class Fps_FacturaEvaluacion
    {
        [Key]
        public int IdEvaluacion { get; set; }

        // Relación con la factura evaluada
        public int IdFactura { get; set; }

        [ForeignKey("IdFactura")]
        public Fps_Facturas Factura { get; set; }

        // Estado de la factura al momento de la evaluación
        public int IdEstado { get; set; }

        [ForeignKey("IdEstado")]
        public Fps_EstadosFactura Estado { get; set; }

        public string? ComentarioAdmin { get; set; }

        public DateTime FechaEvaluacion { get; set; } = DateTime.Now;

        // Opcional, si aplica solo para aprobaciones
        public DateTime? FechaContable { get; set; }

        public string? CodigoUsuario { get; set; }
    }
}
