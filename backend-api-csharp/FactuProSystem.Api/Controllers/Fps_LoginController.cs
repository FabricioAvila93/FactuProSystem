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
    public class Fps_LoginController : Controller
    {
        private readonly FactuProSystemContext _fpscontext;
        private readonly Fps_Utilidades _fpsutilidades;


        public Fps_LoginController(FactuProSystemContext context, Fps_Utilidades utilidades)
        {
            _fpscontext = context;
            _fpsutilidades = utilidades;
        }


        [HttpPost("Login")]
        public async Task<IActionResult> Login(Fps_LoginDTO objeto)
        {
            try
            {
                // 1. Validar el modelo recibido (usuario y contraseña)
                if (!ModelState.IsValid)
                    return BadRequest(new { isSuccess = false, message = "Datos inválidos." });

                // 2. Buscar el usuario por su código
                var usuario = await _fpscontext.Fps_Usuarios
                    .FirstOrDefaultAsync(u => u.CodigoUsuario == objeto.CodigoUsuario);

                // 3. Si el usuario no existe, rechazar login
                if (usuario == null)
                    return Unauthorized(new { isSuccess = false, message = "Usuario o contraseña incorrectos." });

                // 4. Si el usuario está inactivo, no permitir acceso
                if (!usuario.EstaActivo)
                    return Unauthorized(new { isSuccess = false, message = "Usuario está inactivo. Contacte al administrador." });

                // 5. Verificar si ya existe un estado de login para el usuario
                var estadoLogin = await _fpscontext.Fps_UsuariosLoginEstado
                    .FirstOrDefaultAsync(e => e.IdUsuario == usuario.IdUsuario);

                // 6. Si no existe, crear uno nuevo (es su primer login)
                if (estadoLogin == null)
                {
                    estadoLogin = new Fps_UsuariosLoginEstado
                    {
                        IdUsuario = usuario.IdUsuario,
                        IntentosFallidos = 0,
                        EstaBloqueado = false,
                        DebeCambiarClave = true
                    };
                    _fpscontext.Fps_UsuariosLoginEstado.Add(estadoLogin);
                    await _fpscontext.SaveChangesAsync();
                }

                // 7. Si el usuario está bloqueado, verificar si ya pasó el tiempo de bloqueo
                if (estadoLogin.EstaBloqueado)
                {
                    if (estadoLogin.BloqueadoHasta != null && estadoLogin.BloqueadoHasta > DateTime.Now)
                    {
                        // Todavía está bloqueado
                        return Unauthorized(new
                        {
                            isSuccess = false,
                            message = $"Usuario bloqueado hasta {estadoLogin.BloqueadoHasta.Value.ToString("g")}"
                        });
                    }
                    else
                    {
                        // Desbloquear al usuario automáticamente
                        estadoLogin.EstaBloqueado = false;
                        estadoLogin.IntentosFallidos = 0;
                        estadoLogin.BloqueadoHasta = null;
                        await _fpscontext.SaveChangesAsync();
                    }
                }

                // 8. Encriptar la clave ingresada para compararla
                var claveEncriptada = _fpsutilidades.EncriptarSHA256(objeto.Clave.ToUpper());


                // 9. Comparar la clave ingresada con la clave almacenada
                if (usuario.Clave != claveEncriptada)
                {
                    // Si es incorrecta, aumentar el contador de intentos fallidos
                    estadoLogin.IntentosFallidos++;

                    // 10. Si ha fallado 5 veces, bloquear al usuario por 15 minutos e inactivarlo
                    if (estadoLogin.IntentosFallidos >= 5)
                    {
                        estadoLogin.EstaBloqueado = true;
                        estadoLogin.BloqueadoHasta = DateTime.Now.AddMinutes(15);
                        usuario.EstaActivo = false;

                        await _fpscontext.SaveChangesAsync();

                        return Unauthorized(new
                        {
                            isSuccess = false,
                            message = "Usuario bloqueado debido a múltiples intentos fallidos. Contacte al administrador."
                        });
                    }

                    // Devolver mensaje de error por contraseña incorrecta
                    await _fpscontext.SaveChangesAsync();

                    return Unauthorized(new
                    {
                        isSuccess = false,
                        message = "Usuario o contraseña incorrectos."
                    });
                }

                // 11. Si la clave es correcta: resetear el estado de login
                estadoLogin.IntentosFallidos = 0;
                estadoLogin.EstaBloqueado = false;
                estadoLogin.BloqueadoHasta = null;
                estadoLogin.FechaUltimoLogin = DateTime.Now;
                await _fpscontext.SaveChangesAsync();

                // 12. Generar token JWT
                var token = _fpsutilidades.GenerarJWT(usuario);

                // 13. Mostrar mensaje de bienvenida o notificación de cambio de clave
                string mensajeBienvenida = estadoLogin.DebeCambiarClave
                    ? "Debe cambiar su contraseña por primera vez."
                    : $"Bienvenido {usuario.NombreCompleto} al sistema.";

                // 14. Respuesta de éxito con datos y token
                return Ok(new
                {
                    isSuccess = true,
                    token,
                    nombreCompleto = usuario.NombreCompleto,
                    idUsuario = usuario.IdUsuario,
                    codigoUsuario = usuario.CodigoUsuario,
                    idRol = usuario.IdRol,
                    debeCambiarClave = estadoLogin.DebeCambiarClave,
                    mensaje = mensajeBienvenida
                });
            }
            catch (Exception ex)
            {
                // 15. Manejo de errores no controlados
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "Error interno en el servidor al intentar iniciar sesión.",
                    detail = ex.Message
                });
            }
        }



        [HttpPost("CambiarClavePrimerIngreso")]
        public async Task<IActionResult> CambiarClave([FromBody] Fps_CambioClaveDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var usuario = await _fpscontext.Fps_Usuarios.FirstOrDefaultAsync(u => u.CodigoUsuario == dto.CodigoUsuario);
            if (usuario == null)
                return NotFound(new { isSuccess = false, message = "Usuario no encontrado." });

            var estadoLogin = await _fpscontext.Fps_UsuariosLoginEstado.FirstOrDefaultAsync(e => e.IdUsuario == usuario.IdUsuario);
            if (estadoLogin == null)
                return NotFound(new { isSuccess = false, message = "Estado de login no encontrado." });

            usuario.Clave = _fpsutilidades.EncriptarSHA256(dto.NuevaClave);
            estadoLogin.DebeCambiarClave = false;

            await _fpscontext.SaveChangesAsync();

            return Ok(new { isSuccess = true, message = "Contraseña cambiada correctamente." });
        }





    }
}

