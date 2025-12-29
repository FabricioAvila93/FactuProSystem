using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FactuProSystem.Api.Models
{
    public class Fps_UsuariosLoginEstado
    {
        [Key]
        public int IdEstadoLogin { get; set; }

        public int IdUsuario { get; set; }

        public int IntentosFallidos { get; set; }
        public bool EstaBloqueado { get; set; }
        public DateTime? BloqueadoHasta { get; set; }
        public bool DebeCambiarClave { get; set; }
        public DateTime? FechaUltimoLogin { get; set; }

        [ForeignKey("IdUsuario")]
        public Fps_Usuarios Usuario { get; set; }
    }
}
