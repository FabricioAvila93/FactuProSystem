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
    public class Fps_EstadoFacturaController : Controller
    {
        private readonly FactuProSystemContext _fpscontext;
        private readonly Fps_Utilidades _fpsutilidades;


        public Fps_EstadoFacturaController(FactuProSystemContext context, Fps_Utilidades utilidades)
        {
            _fpscontext = context;
            _fpsutilidades = utilidades;
        }




        [HttpGet("ObtenerEstadoFactura")]
        public async Task<IActionResult> ObtenerEstados()
        {
            try
            {
                var estados = await _fpscontext.Fps_EstadosFactura
                    .Select(e => new {
                        idEstado = e.IdEstado,
                        nombreEstado = e.Nombre
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = estados });
            }
            catch (Exception ex)
            {
               
                return StatusCode(500, new { success = false, message = "Error al obtener los estados.", error = ex.Message });
            }
        }





    }
}
