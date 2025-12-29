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
    public class Fps_ProveedorController : Controller
    {
        private readonly FactuProSystemContext _fpscontext;
        private readonly Fps_Utilidades _fpsutilidades;


        public Fps_ProveedorController(FactuProSystemContext context, Fps_Utilidades utilidades)
        {
            _fpscontext = context;
            _fpsutilidades = utilidades;
        }


        [HttpPost("RegistrarProveedor")]
        public async Task<IActionResult> RegistrarProveedor([FromBody] Fps_Proveedor dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.RTNProveedor) || string.IsNullOrWhiteSpace(dto.NombreProveedor))
            {
                return BadRequest("RTN y nombre del proveedor son obligatorios.");
            }

            // Verificar si ya existe RTN
            bool existeRTN = await _fpscontext.Fps_Proveedor.AnyAsync(p => p.RTNProveedor == dto.RTNProveedor);
            if (existeRTN)
            {
                return Conflict(new { isSuccess = false, message = "Ya existe un proveedor con ese RTN." });

            }

            try
            {
                var proveedor = new Fps_Proveedor
                {
                    RTNProveedor = dto.RTNProveedor,
                    NombreProveedor = dto.NombreProveedor,
                    Direccion = dto.Direccion,
                    Telefono = dto.Telefono,
                    Correo = dto.Correo,
                    FechaRegistro = DateTime.Now,
                    UsuarioRegistro = dto.UsuarioRegistro,
                    EstaActivo = true
                };

                _fpscontext.Fps_Proveedor.Add(proveedor);
                await _fpscontext.SaveChangesAsync();

                return Ok(new { isSuccess = true, message = "Proveedor registrado exitosamente." });

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error al registrar proveedor: {ex.Message}" });
            }
        }










        [HttpPut("EditarProveedor/{id}")]
        public async Task<IActionResult> EditarProveedor(int id, [FromBody] Fps_ProveedorDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var proveedor = await _fpscontext.Fps_Proveedor.FindAsync(id);
            if (proveedor == null)
            {
                return NotFound(new { success = false, message = "Proveedor no encontrado" });
            }

            proveedor.RTNProveedor = dto.RTNProveedor;
            proveedor.NombreProveedor = dto.NombreProveedor;
            proveedor.Correo = dto.Correo;
            proveedor.Telefono = dto.Telefono;
            proveedor.Direccion = dto.Direccion;
            proveedor.EstaActivo = dto.EstaActivo;
            proveedor.FechaModificacion = DateTime.Now;
            proveedor.UsuarioModificacion = dto.UsuarioModificacion;

            await _fpscontext.SaveChangesAsync();

            return Ok(new { success = true, message = "Proveedor actualizado exitosamente" });
        }




        [HttpGet("ObtenerProveedorDetalle/{id}")]
        public async Task<IActionResult> ObtenerProveedorDetalle(int id)
        {
            try
            {
                var proveedor = await _fpscontext.Fps_Proveedor
                    .Where(p => p.IdProveedor == id)
                    .Select(p => new Fps_ProveedorDetalleDTO
                    {
                        IdProveedor = p.IdProveedor,
                        RTNProveedor = p.RTNProveedor,
                        NombreProveedor = p.NombreProveedor,
                        Correo = p.Correo,
                        Telefono = p.Telefono,
                        Direccion = p.Direccion,
                        EstaActivo = p.EstaActivo,
                        FechaRegistro = p.FechaRegistro,
                        UsuarioRegistro = p.UsuarioRegistro,
                        FechaModificacion = p.FechaModificacion,
                        UsuarioModificacion = p.UsuarioModificacion,
                    })
                    .FirstOrDefaultAsync();

                if (proveedor == null)
                    return NotFound(new { isSuccess = false, message = "Proveedor no encontrado" });

                return Ok(new { isSuccess = true, data = proveedor });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = $"Error interno al obtener proveedor: {ex.Message}" });
            }
        }






        [HttpGet("ListarProveedores")]
        public async Task<IActionResult> ListarProveedores()
       {
            try
            {
                var proveedores = await _fpscontext.Fps_Proveedor
                    .Select(p => new Fps_ProveedorDetalleDTO
                    {
                        IdProveedor = p.IdProveedor,
                        RTNProveedor = p.RTNProveedor,
                        NombreProveedor = p.NombreProveedor,
                        Correo = p.Correo,
                        Telefono = p.Telefono,
                        Direccion = p.Direccion,
                        EstaActivo = p.EstaActivo,
                        FechaRegistro = p.FechaRegistro,
                        UsuarioRegistro = p.UsuarioRegistro,
                        FechaModificacion = p.FechaModificacion,
                        UsuarioModificacion = p.UsuarioModificacion
                    })
                    .ToListAsync();

                return Ok(new { isSuccess = true, data = proveedores });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "Error al listar proveedores.",
                    detail = ex.Message
                });
            }
        }


        [HttpGet("ObtenerProveedorCombo")]
        public async Task<IActionResult> ObtenerProveedor()
        {
            var proveedor = await _fpscontext.Fps_Proveedor
                .Select(p => new {
                    idProveedor = p.IdProveedor,
                    rtnProveedor = p.RTNProveedor,
                    nombreProveedor = p.NombreProveedor,
                    estaActivo = p.EstaActivo
                })
                .ToListAsync();

            return Ok(new { success = true, data = proveedor });
        }

    }
}
