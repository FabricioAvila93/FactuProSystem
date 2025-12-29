using FactuProSystem.Api.Custom;
using FactuProSystem.Api.Data;
using FactuProSystem.Api.Models;
using FactuProSystem.Api.Models.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FactuProSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Fps_FacturasController : Controller
    {

        private readonly FactuProSystemContext _fpscontext;
        private readonly Fps_Utilidades _fpsutilidades;


        public Fps_FacturasController(FactuProSystemContext context, Fps_Utilidades utilidades)
        {
            _fpscontext = context;
            _fpsutilidades = utilidades;
        }




        [HttpGet("ListarResumenFacturas")]
        public async Task<IActionResult> ObtenerResumenFacturas(
      [FromQuery] int idUsuario,
      [FromQuery] int idRol,
      [FromQuery] string? codigoUsuarioActual,
      [FromQuery] List<int>? estados)
        {
            try
            {
                var query = _fpscontext.Fps_Facturas
                    .Include(f => f.Usuario)
                    .Include(f => f.Proveedor)
                    .Include(f => f.Estado)
                    .AsQueryable();

                if (idRol != 1 && !string.IsNullOrEmpty(codigoUsuarioActual))
                {
                    query = query.Where(f => f.Usuario.CodigoUsuario == codigoUsuarioActual);
                }

                if (estados != null && estados.Any())
                {
                    query = query.Where(f => estados.Contains(f.IdEstado));
                }

                var resumen = await query
                    .Select(f => new Fps_FacturaResumenDTO
                    {
                        IdFactura = f.IdFactura,
                        Fecha = f.Fecha,
                        CodigoUsuario = f.Usuario.CodigoUsuario,
                        EstaActivo = f.EstaActivo,
                        NombreProveedor = f.Proveedor.NombreProveedor,
                        RTNProveedor = f.Proveedor.RTNProveedor,
                        IdEstado = f.IdEstado,
                        NombreEstado = f.Estado.Nombre,

                        // Última evaluación hecha por el admin (rechazada o aprobada)
                        ComentarioAdmin = _fpscontext.Fps_FacturaEvaluacion
                            .Where(fe => fe.IdFactura == f.IdFactura && (fe.IdEstado == 10 || fe.IdEstado == 11))
                            .OrderByDescending(fe => fe.FechaEvaluacion)
                            .ThenByDescending(fe => fe.IdEvaluacion)
                            .Select(fe => fe.ComentarioAdmin)
                            .FirstOrDefault() ?? string.Empty,

                        FechaEvaluacion = _fpscontext.Fps_FacturaEvaluacion
                            .Where(fe => fe.IdFactura == f.IdFactura && (fe.IdEstado == 10 || fe.IdEstado == 11))
                            .OrderByDescending(fe => fe.FechaEvaluacion)
                            .ThenByDescending(fe => fe.IdEvaluacion)
                            .Select(fe => (DateTime?)fe.FechaEvaluacion)
                            .FirstOrDefault(),

                        FechaContable = _fpscontext.Fps_FacturaEvaluacion
                            .Where(fe => fe.IdFactura == f.IdFactura && (fe.IdEstado == 10 || fe.IdEstado == 11))
                            .OrderByDescending(fe => fe.FechaEvaluacion)
                            .ThenByDescending(fe => fe.IdEvaluacion)
                            .Select(fe => fe.FechaContable)
                            .FirstOrDefault(),
                    })
                    .OrderByDescending(x => x.FechaEvaluacion)
                    .ToListAsync();

                return Ok(new { success = true, data = resumen });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }







        [HttpPost("RegistrarFactura")]
        public async Task<IActionResult> RegistrarFactura(Fps_FacturaCompletaDTO dto)
        {
            using var transaction = await _fpscontext.Database.BeginTransactionAsync();
            try
            {
                // Construir el documento fiscal completo
                string documentoFiscal = $"{dto.Establecimiento}-{dto.PuntoEmision}-{dto.TipoDocumento}-{dto.Correlativo}";

                // Verificar si ya existe
                bool existe = await _fpscontext.Fps_Facturas.AnyAsync(f =>
                    f.Establecimiento == dto.Establecimiento &&
                    f.PuntoEmision == dto.PuntoEmision &&
                    f.TipoDocumento == dto.TipoDocumento &&
                    f.Correlativo == dto.Correlativo
                );

                if (existe)
                {
                    return BadRequest(new { success = false, message = "El documento fiscal ya pertenece a otra factura." });
                }


                var factura = new Fps_Facturas
                {
                    Fecha = dto.Fecha,
                    Establecimiento = dto.Establecimiento,
                    PuntoEmision = dto.PuntoEmision,
                    TipoDocumento = dto.TipoDocumento,
                    Correlativo = dto.Correlativo.PadLeft(8, '0'), // normalizar correlativo
                    CAI = dto.CAI,
                    FechaRegistro = DateTime.Now,
                    UsuarioRegistro = dto.UsuarioRegistro,
                    IdUsuario = dto.IdUsuario,
                    EstaActivo = true,
                    IdDocumento = dto.IdDocumento,
                    NumeroDocumentoRecibo = dto.NumeroDocumentoRecibo,
                    KilometrajeRecorrido = dto.KilometrajeRecorrido,
                    EsGasolina = dto.EsGasolina,
                    IdProveedor = dto.IdProveedor,
                    IdEstado = 9 // Pendiente 
                };

                _fpscontext.Fps_Facturas.Add(factura);
                await _fpscontext.SaveChangesAsync();


                var montos = new Fps_MontosFactura
                {
                    IdFactura = factura.IdFactura,
                    Exentas = dto.Exentas,
                    Grav15 = dto.Grav15,
                    Grav18 = dto.Grav18,
                    Impuesto15 = dto.Impuesto15,
                    Impuesto18 = dto.Impuesto18,
                    TotalCompra = dto.TotalCompra
                };

                _fpscontext.Fps_MontosFactura.Add(montos);


                var evaluacion = new Fps_FacturaEvaluacion
                {
                    IdFactura = factura.IdFactura,
                    IdEstado = 9, // Pendiente
                    CodigoUsuario = dto.UsuarioRegistro,
                    FechaEvaluacion = DateTime.Now,
                    ComentarioAdmin = "Factura registrada y en espera de evaluación"
                };

                _fpscontext.Fps_FacturaEvaluacion.Add(evaluacion);

                await _fpscontext.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Factura registrada y evaluación creada correctamente." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }



        [HttpGet("ObtenerFacturaDetalle/{id}")]
        public async Task<IActionResult> ObtenerFacturaDetalle(int id)
        {
            try
            {
                var factura = await (
                    from f in _fpscontext.Fps_Facturas
                    join p in _fpscontext.Fps_Proveedor on f.IdProveedor equals p.IdProveedor
                    join m in _fpscontext.Fps_MontosFactura on f.IdFactura equals m.IdFactura into fm
                    from montos in fm.DefaultIfEmpty()
                    where f.IdFactura == id
                    select new Fps_FacturaDetalleDTO
                    {
                        IdFactura = f.IdFactura,
                        Fecha = f.Fecha,
                        Establecimiento = f.Establecimiento,
                        PuntoEmision = f.PuntoEmision,
                        TipoDocumento = f.TipoDocumento,
                        Correlativo = f.Correlativo,
                        CAI = f.CAI,

                        NumeroDocumentoRecibo = f.NumeroDocumentoRecibo,
                        KilometrajeRecorrido = f.KilometrajeRecorrido,
                        EsGasolina = f.EsGasolina,

                        IdDocumento = f.IdDocumento,
                        IdUsuario = f.IdUsuario,
                        IdEstado = f.IdEstado,
                        IdProveedor = f.IdProveedor,

                        RTNProveedor = p.RTNProveedor,
                        NombreProveedor = p.NombreProveedor,

                        Exentas = montos.Exentas,
                        Grav15 = montos.Grav15,
                        Grav18 = montos.Grav18,
                        Impuesto15 = montos.Impuesto15,
                        Impuesto18 = montos.Impuesto18,
                        TotalCompra = montos.TotalCompra,

                        UsuarioRegistro = f.UsuarioRegistro,
                        FechaRegistro = f.FechaRegistro,
                        UsuarioModificacion = f.UsuarioModificacion,
                        FechaModificacion = f.FechaModificacion,

                        EstaActivo = f.EstaActivo
                    }
                ).FirstOrDefaultAsync();

                if (factura == null)
                    return NotFound(new { isSuccess = false, message = "Factura no encontrada" });

                return Ok(new { isSuccess = true, data = factura });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = $"Error interno al obtener factura: {ex.Message}" });
            }
        }

       




        [HttpPut("EditarFactura/{id}")]
        public async Task<IActionResult> EditarFactura(int id, [FromBody] Fps_FacturaCompletaDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var transaction = await _fpscontext.Database.BeginTransactionAsync();
            try
            {
                var factura = await _fpscontext.Fps_Facturas.FindAsync(id);
                if (factura == null)
                    return NotFound(new { success = false, message = "Factura no encontrada" });

                // Guardar estado previo para revisar si era rechazada
                bool estabaRechazada = factura.IdEstado == 11; // 11 = Rechazada

                // Normalizar correlativo
                var correlativoNormalizado = dto.Correlativo.PadLeft(8, '0');

                // Determinar si se modificó el documento fiscal
                bool documentoModificado = factura.Establecimiento != dto.Establecimiento ||
                                           factura.PuntoEmision != dto.PuntoEmision ||
                                           factura.TipoDocumento != dto.TipoDocumento ||
                                           factura.Correlativo != correlativoNormalizado;

                // Validar existencia solo si se modificó el documento
                if (documentoModificado)
                {
                    var existeFactura = await _fpscontext.Fps_Facturas
                        .AnyAsync(f => f.IdProveedor == dto.IdProveedor
                                       && f.Establecimiento == dto.Establecimiento
                                       && f.PuntoEmision == dto.PuntoEmision
                                       && f.TipoDocumento == dto.TipoDocumento
                                       && f.Correlativo == correlativoNormalizado
                                       && f.IdFactura != id);

                    if (existeFactura)
                        return Conflict(new { success = false, message = "El documento fiscal ya existe para este proveedor." });
                }

                // Actualizar campos relevantes
                factura.Fecha = dto.Fecha;
                factura.Establecimiento = dto.Establecimiento;
                factura.PuntoEmision = dto.PuntoEmision;
                factura.TipoDocumento = dto.TipoDocumento;
                factura.Correlativo = correlativoNormalizado;
                factura.CAI = dto.CAI;
                factura.NumeroDocumentoRecibo = dto.NumeroDocumentoRecibo;
                factura.KilometrajeRecorrido = dto.KilometrajeRecorrido;
                factura.EsGasolina = dto.EsGasolina;
                factura.IdProveedor = dto.IdProveedor;
                factura.IdUsuario = dto.IdUsuario;
                factura.IdDocumento = dto.IdDocumento;
                factura.EstaActivo = dto.EstaActivo;
                factura.UsuarioModificacion = dto.UsuarioModificacion;
                factura.FechaModificacion = DateTime.Now;

                // Si estaba rechazada, cambiar estado a Pendiente y registrar historial
                if (estabaRechazada)
                {
                    factura.IdEstado = 9; // Pendiente
                    var historial = new Fps_FacturaEvaluacion
                    {
                        IdFactura = factura.IdFactura,
                        IdEstado = 9, // Pendiente
                        CodigoUsuario = dto.UsuarioModificacion,
                        FechaEvaluacion = DateTime.Now,
                        ComentarioAdmin = "Factura reenviada tras corrección"
                    };
                    _fpscontext.Fps_FacturaEvaluacion.Add(historial);
                }

                // Actualizar montos
                var montos = await _fpscontext.Fps_MontosFactura.FirstOrDefaultAsync(m => m.IdFactura == id);
                if (montos == null)
                {
                    montos = new Fps_MontosFactura
                    {
                        IdFactura = id,
                        Exentas = dto.Exentas,
                        Grav15 = dto.Grav15,
                        Grav18 = dto.Grav18,
                        Impuesto15 = dto.Impuesto15,
                        Impuesto18 = dto.Impuesto18,
                        TotalCompra = dto.TotalCompra
                    };
                    _fpscontext.Fps_MontosFactura.Add(montos);
                }
                else
                {
                    montos.Exentas = dto.Exentas;
                    montos.Grav15 = dto.Grav15;
                    montos.Grav18 = dto.Grav18;
                    montos.Impuesto15 = dto.Impuesto15;
                    montos.Impuesto18 = dto.Impuesto18;
                    montos.TotalCompra = dto.TotalCompra;
                }

                await _fpscontext.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, message = "Factura actualizada correctamente." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                var errorMsg = ex.Message;
                if (ex.InnerException != null)
                    errorMsg += " | Inner Exception: " + ex.InnerException.Message;

                return StatusCode(500, new { success = false, message = errorMsg });
            }
        }











        [HttpPut("EvaluarFactura")]
        public async Task<IActionResult> EvaluarFactura([FromBody] Fps_FacturaEvaluacionDTO evaluacion)
        {
            try
            {
                var factura = await _fpscontext.Fps_Facturas.FindAsync(evaluacion.IdFactura);
                if (factura == null)
                {
                    return NotFound(new { success = false, message = "Factura no encontrada" });
                }

                // Actualizar solo el IdEstado en la factura
                factura.IdEstado = evaluacion.IdEstado;
                factura.FechaModificacion = DateTime.Now;

                // Crear registro de evaluación
                Fps_FacturaEvaluacion facturaEvaluacion = new Fps_FacturaEvaluacion
                {
                    IdFactura = evaluacion.IdFactura,
                    IdEstado = evaluacion.IdEstado,
                    CodigoUsuario = evaluacion.CodigoUsuario,
                    FechaEvaluacion = evaluacion.FechaEvaluacion.Date // solo fecha
                };

                if (evaluacion.IdEstado == 10) // Aprobada
                {
                    facturaEvaluacion.FechaContable = DateTime.Now.Date; // solo fecha
                    facturaEvaluacion.ComentarioAdmin = evaluacion.ComentarioAdmin;
                }
                else if (evaluacion.IdEstado == 11) // Rechazada
                {
                    facturaEvaluacion.FechaContable = null;
                    facturaEvaluacion.ComentarioAdmin = evaluacion.ComentarioAdmin;
                }

                _fpscontext.Fps_FacturaEvaluacion.Add(facturaEvaluacion);
                await _fpscontext.SaveChangesAsync();

                return Ok(new { success = true, message = "Evaluación guardada correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }





    }
}
