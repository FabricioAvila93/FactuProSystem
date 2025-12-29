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
    public class Fps_AgenciasController : Controller
    {
        private readonly FactuProSystemContext _fpscontext;
        private readonly Fps_Utilidades _fpsutilidades;


        public Fps_AgenciasController(FactuProSystemContext context, Fps_Utilidades utilidades)
        {
            _fpscontext = context;
            _fpsutilidades = utilidades;
        }




        [HttpGet("ObtenerAgencias")]
        public async Task<IActionResult> ObtenerAgencias()
        {
            try
            {
                var agencias = await _fpscontext.Fps_Agencias
                    .Where(a => a.EstaActivo)
                    .Select(a => new {
                        id = a.IdAgencia,
                        nombre = a.NombreAgencia
                    })
                    .ToListAsync();

                return Ok(new { isSuccess = true, data = agencias });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error al obtener agencias", detail = ex.Message });
            }
        }





    }
}