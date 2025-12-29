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
    public class Fps_ProveedorCaiRangoController : Controller
    {
        private readonly FactuProSystemContext _fpscontext;
        private readonly Fps_Utilidades _fpsutilidades;


        public Fps_ProveedorCaiRangoController(FactuProSystemContext context, Fps_Utilidades utilidades)
        {
            _fpscontext = context;
            _fpsutilidades = utilidades;
        }




        //[HttpPost("RegistrarRangoCai")]
        //public async Task<IActionResult> RegistrarRangoCai([FromBody] Fps_ProveedorCaiRango dto)
        //{
        //    try
        //    {
        //        if (dto == null || string.IsNullOrWhiteSpace(dto.CAI))
        //            return BadRequest(new { success = false, message = "Datos incompletos" });


        //        var rango = new Fps_ProveedorCaiRango
        //        {
        //            IdProveedor = dto.IdProveedor,
        //            CAI = dto.CAI,
        //            CodigoEstablecimiento = dto.CodigoEstablecimiento,
        //            PuntoEmision = dto.PuntoEmision,
        //            TipoDocumento = dto.TipoDocumento,
        //            CorrelativoInicio = dto.CorrelativoInicio,
        //            CorrelativoFin = dto.CorrelativoFin,
        //            DocumentoFiscal_Inicio = dto.DocumentoFiscal_Inicio,
        //            DocumentoFiscal_Fin = dto.DocumentoFiscal_Fin,
        //            FechaRegistro = DateTime.Now,
        //            UsuarioRegistro = dto.UsuarioRegistro,
        //            FechaExpiracion = dto.FechaExpiracion,
        //            EstaActivo = true
        //        };

        //        _fpscontext.Fps_ProveedorCaiRango.Add(rango);
        //        await _fpscontext.SaveChangesAsync();

        //        return Ok(new { success = true, message = "Rango CAI registrado correctamente" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { success = false, message = "Error al registrar rango CAI", error = ex.Message });
        //    }
        //}


        [HttpPost("RegistrarRangoCai")]
        public async Task<IActionResult> RegistrarRangoCai([FromBody] Fps_ProveedorCaiRango dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.CAI))
                    return BadRequest(new { success = false, message = "Datos incompletos" });

                // VALIDACIÓN 1: CAI único
                bool caiExistente = await _fpscontext.Fps_ProveedorCaiRango
                    .AnyAsync(r => r.CAI == dto.CAI && r.EstaActivo);
                if (caiExistente)
                    return Conflict(new { success = false, message = "El CAI ya existe en otro rango." });

                // VALIDACIÓN 2: DocumentoFiscal único (inicio-fin)
                bool documentoExistente = await _fpscontext.Fps_ProveedorCaiRango
                    .AnyAsync(r => r.DocumentoFiscal_Inicio == dto.DocumentoFiscal_Inicio &&
                                   r.DocumentoFiscal_Fin == dto.DocumentoFiscal_Fin);
                if (documentoExistente)
                    return Conflict(new { success = false, message = "El rango de documentos fiscales ya existe." });

                // VALIDACIÓN 3: Evitar solapamiento de rangos
                bool rangoSolapado = await _fpscontext.Fps_ProveedorCaiRango
                    .AnyAsync(r =>
                        r.CodigoEstablecimiento == dto.CodigoEstablecimiento &&
                        r.PuntoEmision == dto.PuntoEmision &&
                        r.TipoDocumento == dto.TipoDocumento &&
                        ((dto.CorrelativoInicio.CompareTo(r.CorrelativoFin) <= 0 &&
                          dto.CorrelativoFin.CompareTo(r.CorrelativoInicio) >= 0))
                    );
                if (rangoSolapado)
                    return Conflict(new { success = false, message = "El rango correlativo se solapa con otro rango existente." });

                var rango = new Fps_ProveedorCaiRango
                {
                    IdProveedor = dto.IdProveedor,
                    CAI = dto.CAI,
                    CodigoEstablecimiento = dto.CodigoEstablecimiento,
                    PuntoEmision = dto.PuntoEmision,
                    TipoDocumento = dto.TipoDocumento,
                    CorrelativoInicio = dto.CorrelativoInicio,
                    CorrelativoFin = dto.CorrelativoFin,
                    DocumentoFiscal_Inicio = dto.DocumentoFiscal_Inicio,
                    DocumentoFiscal_Fin = dto.DocumentoFiscal_Fin,
                    FechaRegistro = DateTime.Now,
                    UsuarioRegistro = dto.UsuarioRegistro,
                    FechaExpiracion = dto.FechaExpiracion,
                    EstaActivo = true
                };

                _fpscontext.Fps_ProveedorCaiRango.Add(rango);
                await _fpscontext.SaveChangesAsync();

                return Ok(new { success = true, message = "Rango CAI registrado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al registrar rango CAI", error = ex.Message });
            }
        }





        [HttpGet("ListarPorProveedor/{idProveedor}")]
            public async Task<IActionResult> ListarPorProveedor(int idProveedor)
            {
                try
                {
                    var proveedor = await _fpscontext.Fps_Proveedor
                        .FirstOrDefaultAsync(p => p.IdProveedor == idProveedor);

                    if (proveedor == null)
                    {
                        return NotFound(new { success = false, message = "Proveedor no encontrado." });
                    }

                    var rangos = await _fpscontext.Fps_ProveedorCaiRango
                         .Where(r => r.IdProveedor == idProveedor)
                         .Select(r => new Fps_ProveedorCaiRangoDTO
                         {
                             IdRangoCAI = r.IdRangoCAI,
                             IdProveedor = r.IdProveedor,
                             CAI = r.CAI,
                             CodigoEstablecimiento = r.CodigoEstablecimiento,
                             PuntoEmision = r.PuntoEmision,
                             TipoDocumento = r.TipoDocumento,
                             CorrelativoInicio = r.CorrelativoInicio,
                             CorrelativoFin = r.CorrelativoFin,
                             DocumentoFiscal_Inicio = r.DocumentoFiscal_Inicio,
                             DocumentoFiscal_Fin = r.DocumentoFiscal_Fin,
                             FechaRegistro = r.FechaRegistro,
                             UsuarioRegistro = r.UsuarioRegistro,
                             FechaExpiracion = r.FechaExpiracion,
                             EstaActivo = r.EstaActivo
                         })
                         .ToListAsync();

                    return Ok(new
                    {
                        success = true,
                        nombreProveedor = proveedor.NombreProveedor,
                        rangos = rangos
                    });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { success = false, message = "Error al listar los rangos CAI", error = ex.Message });
                }
            }









        [HttpGet("ListarConNombrePorProveedor/{idProveedor}")]
        public async Task<IActionResult> ListarConNombrePorProveedor(int idProveedor)
        {
            try
            {
                var proveedor = await _fpscontext.Fps_Proveedor.FindAsync(idProveedor);

                if (proveedor == null)
                {
                    return Ok(new
                    {
                        success = false,
                        mensaje = "Proveedor no encontrado.",
                        nombreProveedor = "",
                        rangos = new List<object>()
                    });
                }

                var rangos = await _fpscontext.Fps_ProveedorCaiRango
                    .Where(r => r.IdProveedor == idProveedor)
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    mensaje = rangos.Any() ? "Rangos encontrados." : "Proveedor sin rangos registrados.",
                    nombreProveedor = proveedor.NombreProveedor,
                    rangos = rangos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al obtener rangos con nombre proveedor.",
                    error = ex.Message,
                    nombreProveedor = "",
                    rangos = new List<object>()
                });
            }
        }





        [HttpGet("ObtenerRangoCaiDetalle/{id}")]
        public async Task<IActionResult> ObtenerRangoCaiDetalle(int id)
        {
            try
            {
                var rango = await _fpscontext.Fps_ProveedorCaiRango
                    .Where(r => r.IdRangoCAI == id)
                    .Select(r => new Fps_ProveedorCaiRangoDetalleDTO
                    {
                        IdRangoCAI = r.IdRangoCAI,
                        IdProveedor = r.IdProveedor,
                        NombreProveedor = r.Fps_Proveedor.NombreProveedor,
                        CAI = r.CAI,
                        CodigoEstablecimiento = r.CodigoEstablecimiento,
                        PuntoEmision = r.PuntoEmision,
                        TipoDocumento = r.TipoDocumento,
                        CorrelativoInicio = r.CorrelativoInicio,
                        CorrelativoFin = r.CorrelativoFin,
                        DocumentoFiscal_Inicio = r.DocumentoFiscal_Inicio,
                        DocumentoFiscal_Fin = r.DocumentoFiscal_Fin,
                        FechaRegistro = r.FechaRegistro,
                        UsuarioRegistro = r.UsuarioRegistro,
                        FechaModificacion = r.FechaModificacion,
                        UsuarioModificacion = r.UsuarioModificacion,
                        FechaExpiracion = r.FechaExpiracion,
                        EstaActivo = r.EstaActivo
                    })
                    .FirstOrDefaultAsync();

                if (rango == null)
                    return NotFound(new { isSuccess = false, message = "Rango CAI no encontrado" });

                return Ok(new { isSuccess = true, data = rango });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = $"Error interno al obtener el rango CAI: {ex.Message}" });
            }
        }






        [HttpPut("EditarRangoCai/{id}")]
        public async Task<IActionResult> EditarRangoCai(int id, [FromBody] Fps_ProveedorCaiRangoDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != dto.IdRangoCAI)
                    return BadRequest(new { success = false, message = "El ID del rango CAI no coincide." });

                var rango = await _fpscontext.Fps_ProveedorCaiRango.FindAsync(id);
                if (rango == null)
                    return NotFound(new { success = false, message = "Rango CAI no encontrado" });

                rango.CAI = dto.CAI;
                rango.CodigoEstablecimiento = dto.CodigoEstablecimiento;
                rango.PuntoEmision = dto.PuntoEmision;
                rango.TipoDocumento = dto.TipoDocumento;
                rango.CorrelativoInicio = dto.CorrelativoInicio;
                rango.CorrelativoFin = dto.CorrelativoFin;
                rango.DocumentoFiscal_Inicio = dto.DocumentoFiscal_Inicio;
                rango.DocumentoFiscal_Fin = dto.DocumentoFiscal_Fin;
                rango.EstaActivo = dto.EstaActivo;

                rango.FechaModificacion = DateTime.Now;
                rango.UsuarioModificacion = dto.UsuarioModificacion;
                rango.FechaExpiracion = dto.FechaExpiracion;
                await _fpscontext.SaveChangesAsync();

                return Ok(new { success = true, message = "Rango CAI actualizado exitosamente" });
            }
            catch (Exception ex)
            {
              
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error interno del servidor",
                    detail = ex.ToString() 
                });
            }
        }





        //[HttpGet("ValidarDocumentoCompleto/{idProveedor}/{documentoFiscal}/{idFactura?}")]
        //public async Task<IActionResult> ValidarDocumentoCompleto(int idProveedor, string documentoFiscal, int? idFactura = null)
        //{
        //    try
        //    {

        //        var partes = documentoFiscal.Split('-');
        //        if (partes.Length < 4)
        //            return BadRequest(new { success = false, message = "Formato incorrecto." });

        //        string codigoEstablecimiento = partes[0];
        //        string puntoEmision = partes[1];
        //        string tipoDocumento = partes[2];
        //        string correlativo = partes[3].PadLeft(8, '0'); // Normalizamos a 8 dígitos

        //        //Verificar que existe el documento concatenado en los registros de CAI
        //        var rango = await _fpscontext.Fps_ProveedorCaiRango
        //            .Where(r => r.IdProveedor == idProveedor
        //                        && r.CodigoEstablecimiento == codigoEstablecimiento
        //                        && r.PuntoEmision == puntoEmision
        //                        && r.TipoDocumento == tipoDocumento
        //                        && r.EstaActivo)
        //            .FirstOrDefaultAsync();

        //        if (rango == null)
        //            return Ok(new { success = false, message = "Documento fuera de rango CAI válido." });

        //        // Construir correlativos numéricos para comparar rangos
        //        long correlativoNum = long.Parse(correlativo);
        //        long inicioNum = long.Parse(rango.CorrelativoInicio.PadLeft(8, '0'));
        //        long finNum = long.Parse(rango.CorrelativoFin.PadLeft(8, '0'));

        //        // Verificar que el correlativo esté dentro del rango
        //        if (correlativoNum < inicioNum || correlativoNum > finNum)
        //            return Ok(new { success = false, message = "El correlativo está fuera del rango CAI." });

        //        //Verificar si ya existe el documento en otra factura (ignorando la propia si estamos editando)
        //        bool existeDocumento = idFactura.HasValue
        //            ? await _fpscontext.Fps_Facturas
        //                  .AnyAsync(f => f.Establecimiento == codigoEstablecimiento &&
        //                                 f.PuntoEmision == puntoEmision &&
        //                                 f.TipoDocumento == tipoDocumento &&
        //                                 f.Correlativo == correlativo &&
        //                                 f.IdFactura != idFactura.Value)
        //            : await _fpscontext.Fps_Facturas
        //                  .AnyAsync(f => f.Establecimiento == codigoEstablecimiento &&
        //                                 f.PuntoEmision == puntoEmision &&
        //                                 f.TipoDocumento == tipoDocumento &&
        //                                 f.Correlativo == correlativo);

        //        if (existeDocumento)
        //            return Ok(new { success = false, message = "Este documento fiscal ya pertenece a otra factura.", existe = true });

        //        return Ok(new
        //        {
        //            success = true,
        //            message = "Documento válido y único dentro del rango CAI.",
        //            cai = rango.CAI,
        //            existe = false
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { success = false, message = "Error validando documento.", error = ex.Message });
        //    }
        //}


        [HttpGet("ValidarDocumentoCompleto/{idProveedor}/{documentoFiscal}/{idFactura?}")]
        public async Task<IActionResult> ValidarDocumentoCompleto(int idProveedor, string documentoFiscal, int? idFactura = null)
        {
            try
            {
                var partes = documentoFiscal.Split('-');
                if (partes.Length < 4)
                    return BadRequest(new { success = false, message = "Formato de documento incorrecto." });

                string codigoEstablecimiento = partes[0];
                string puntoEmision = partes[1];
                string tipoDocumento = partes[2];
                string correlativo = partes[3].PadLeft(8, '0'); // Normalizamos a 8 dígitos

                // Buscar el rango del proveedor
                var rango = await _fpscontext.Fps_ProveedorCaiRango
                    .Where(r => r.IdProveedor == idProveedor &&
                                r.CodigoEstablecimiento == codigoEstablecimiento &&
                                r.PuntoEmision == puntoEmision &&
                                r.TipoDocumento == tipoDocumento)
                    .FirstOrDefaultAsync();

                if (rango == null)
                    return Ok(new { success = false, message = "El documento fiscal no pertenece a ningún rango CAI válido." });

                // Validar si el CAI está activo y no expirado
                bool estaActivo = rango.EstaActivo &&
                                  (!rango.FechaExpiracion.HasValue || rango.FechaExpiracion >= DateTime.Now);

                if (!estaActivo)
                    return Ok(new { success = false, message = "El CAI asociado a este documento está inactivo o expirado." });

                // Validar correlativo dentro del rango
                long correlativoNum = long.Parse(correlativo);
                long inicioNum = long.Parse(rango.CorrelativoInicio.PadLeft(8, '0'));
                long finNum = long.Parse(rango.CorrelativoFin.PadLeft(8, '0'));

                if (correlativoNum < inicioNum || correlativoNum > finNum)
                    return Ok(new { success = false, message = "El correlativo ingresado está fuera del rango CAI." });

                // Validar duplicado (excluyendo si está editando)
                bool existeDocumento = idFactura.HasValue
                    ? await _fpscontext.Fps_Facturas.AnyAsync(f =>
                        f.Establecimiento == codigoEstablecimiento &&
                        f.PuntoEmision == puntoEmision &&
                        f.TipoDocumento == tipoDocumento &&
                        f.Correlativo == correlativo &&
                        f.IdFactura != idFactura.Value)
                    : await _fpscontext.Fps_Facturas.AnyAsync(f =>
                        f.Establecimiento == codigoEstablecimiento &&
                        f.PuntoEmision == puntoEmision &&
                        f.TipoDocumento == tipoDocumento &&
                        f.Correlativo == correlativo);

                if (existeDocumento)
                    return Ok(new { success = false, message = "Este documento fiscal ya pertenece a otra factura.", existe = true });

                // Si todo está bien
                return Ok(new
                {
                    success = true,
                    message = "Documento válido y único dentro del rango CAI.",
                    cai = rango.CAI,
                    estaActivo = true,
                    existe = false
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error validando el documento fiscal.", error = ex.Message });
            }
        }





    }
}
