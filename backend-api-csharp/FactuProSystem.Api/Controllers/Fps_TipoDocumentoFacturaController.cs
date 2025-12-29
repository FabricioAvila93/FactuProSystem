using FactuProSystem.Api.Custom;
using FactuProSystem.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FactuProSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Fps_TipoDocumentoFacturaController : Controller
    {

        private readonly FactuProSystemContext _fpscontext;
        private readonly Fps_Utilidades _fpsutilidades;


        public Fps_TipoDocumentoFacturaController(FactuProSystemContext context, Fps_Utilidades utilidades)
        {
            _fpscontext = context;
            _fpsutilidades = utilidades;
        }





        [HttpGet("ObtenerTipoDocumentoFactura")]
        public async Task<IActionResult> ObtenerDocumento()
        {
            try
            {
                var documento = await _fpscontext.Fps_Documento
                    .Select(d => new {
                        id = d.IdDocumento,
                        codigo = d.Codigo,
                        nombreDocumento = d.Nombre
                    })
                    .ToListAsync();

                return Ok(new { isSuccess = true, data = documento });
            }
            catch (Exception ex)
            {
            
                return StatusCode(500, new { isSuccess = false, message = "Ocurrió un error al obtener los documentos.", error = ex.Message });
            }
        }

    }
}
