using FactuProSystem.Api.Custom;
using FactuProSystem.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FactuProSystem.Api.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class Fps_RolesController : Controller
    {
        private readonly FactuProSystemContext _fpscontext;
        private readonly Fps_Utilidades _fpsutilidades;


        public Fps_RolesController(FactuProSystemContext context, Fps_Utilidades utilidades)
        {
            _fpscontext = context;
            _fpsutilidades = utilidades;
        }



        [HttpGet("ObtenerRol")]
        public async Task<IActionResult> ObtenerRol()
        {
            try
            {
                var rol = await _fpscontext.Fps_Roles
                    .Where(a => a.EstaActivo)
                    .Select(a => new {
                        id = a.IdRol,
                        nombre = a.NombreRol
                    })
                    .ToListAsync();

                return Ok(new { isSuccess = true, data = rol });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { isSuccess = false, message = "Error al obtener roles", detail = ex.Message });
            }
        }


    }
}
