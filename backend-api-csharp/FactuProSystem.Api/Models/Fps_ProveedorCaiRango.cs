using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FactuProSystem.Api.Models
{
    public class Fps_ProveedorCaiRango
    {
        [Key]
        public int IdRangoCAI { get; set; }

        [ForeignKey(nameof(Fps_Proveedor))]
        public int IdProveedor { get; set; }

        [Required]
        [MaxLength(50)]
        public string CAI { get; set; } 
        [Required]
        [MaxLength(3)]
        public string CodigoEstablecimiento { get; set; } 
        [Required]
        [MaxLength(3)]
        public string PuntoEmision { get; set; } 
        [Required]
        [MaxLength(20)]
        public string TipoDocumento { get; set; } 

        [Required]
        [MaxLength(20)]
        public string CorrelativoInicio { get; set; } 

        [Required]
        [MaxLength(20)]
        public string CorrelativoFin { get; set; } 

        [Required]
        [MaxLength(50)]
        public string? DocumentoFiscal_Inicio { get; set; } 

        [Required]
        [MaxLength(50)]
        public string? DocumentoFiscal_Fin { get; set; } 

        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        public DateTime? FechaModificacion { get; set; }

        [MaxLength(50)]
        public string? UsuarioRegistro { get; set; }

        [MaxLength(50)]
        public string? UsuarioModificacion { get; set; }
        public bool EstaActivo { get; set; } = true;
        public DateTime? FechaExpiracion { get; set; }

        public virtual Fps_Proveedor? Fps_Proveedor { get; set; }
    }
}
