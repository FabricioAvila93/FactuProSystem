using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FactuProSystem.Api.Models
{
    public class Fps_Facturas
    {

        [Key]
        public int IdFactura { get; set; }

        [Required]
        public DateTime Fecha { get; set; }

        public string? Establecimiento { get; set; }
        public string? PuntoEmision { get; set; }
        public string? TipoDocumento { get; set; }
        public string? Correlativo { get; set; }
        public string? CAI { get; set; }

        [Required]
        public string UsuarioRegistro { get; set; }
        public DateTime? FechaRegistro { get; set; }

        public string? UsuarioModificacion { get; set; }
        public DateTime? FechaModificacion { get; set; }

        public int IdDocumento { get; set; }

        [ForeignKey("IdDocumento")]
        public Fps_Documento Documento { get; set; }
        public string? NumeroDocumentoRecibo { get; set; }
        public decimal? KilometrajeRecorrido { get; set; }

        public bool EsGasolina { get; set; }

        public int IdEstado { get; set; }

        [ForeignKey("IdEstado")]
        public Fps_EstadosFactura Estado { get; set; }
        public int IdUsuario { get; set; }

        [ForeignKey("IdUsuario")]
        public Fps_Usuarios Usuario { get; set; }


        public int IdProveedor { get; set; }

        [ForeignKey("IdProveedor")]
        public Fps_Proveedor Proveedor { get; set; }


        public bool EstaActivo { get; set; } = true;

        // Relación uno a uno con Montos
        public virtual Fps_MontosFactura? MontosFactura { get; set; }


    }
}
