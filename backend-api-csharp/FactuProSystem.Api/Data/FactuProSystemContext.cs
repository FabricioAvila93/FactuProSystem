using Microsoft.EntityFrameworkCore;
using FactuProSystem.Api.Models;

namespace FactuProSystem.Api.Data
{
    public class FactuProSystemContext : DbContext
    {
        public FactuProSystemContext(DbContextOptions<FactuProSystemContext> options) : base(options){}

        public DbSet<Fps_Usuarios> Fps_Usuarios { get; set; }
        public DbSet<Fps_UsuariosLoginEstado> Fps_UsuariosLoginEstado { get; set; }
        public DbSet<Fps_Roles> Fps_Roles { get; set; }
        public DbSet<Fps_Agencias> Fps_Agencias { get; set; }
        public DbSet<Fps_Proveedor> Fps_Proveedor { get; set; }
        public DbSet<Fps_ProveedorCaiRango> Fps_ProveedorCaiRango { get; set; }
        public DbSet<Fps_Documento> Fps_Documento { get; set; }
        public DbSet<Fps_EstadosFactura> Fps_EstadosFactura { get; set; }
        public DbSet<Fps_Facturas> Fps_Facturas { get; set; }
        public DbSet<Fps_MontosFactura> Fps_MontosFactura { get; set; }
        public DbSet<Fps_FacturaEvaluacion> Fps_FacturaEvaluacion { get; set; }




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Fps_Facturas>()
                .HasOne(f => f.MontosFactura)
                .WithOne(m => m.Factura)
                .HasForeignKey<Fps_MontosFactura>(m => m.IdFactura);

            base.OnModelCreating(modelBuilder);
        }



    }
}
