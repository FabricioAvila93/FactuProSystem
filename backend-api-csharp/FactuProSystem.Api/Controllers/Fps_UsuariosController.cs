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
    public class Fps_UsuariosController : Controller
    {
        private readonly FactuProSystemContext _fpscontext;
        private readonly Fps_Utilidades _fpsutilidades;


        public Fps_UsuariosController(FactuProSystemContext context, Fps_Utilidades utilidades)
        {
            _fpscontext = context;
            _fpsutilidades = utilidades;
        }





        [HttpPost("CrearUsuario")]
        public async Task<IActionResult> CrearUsuario([FromBody] Fps_UsuarioDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest(new
                    {
                        isSuccess = false,
                        message = "Los datos del usuario son requeridos.",
                        data = (object?)null
                    });
                }

                var existeIdentificacion = await _fpscontext.Fps_Usuarios
                    .AnyAsync(u => u.Identificacion == dto.Identificacion);
                if (existeIdentificacion)
                {
                    return Conflict(new
                    {
                        isSuccess = false,
                        message = "Ya existe un usuario con esa identificación.",
                        data = (object?)null
                    });
                }

                var existeCodigo = await _fpscontext.Fps_Usuarios
                    .AnyAsync(u => u.CodigoUsuario == dto.CodigoUsuario);
                if (existeCodigo)
                {
                    return Conflict(new
                    {
                        isSuccess = false,
                        message = "Ya existe un usuario con ese código.",
                        data = (object?)null
                    });
                }

                var nuevoUsuario = new Fps_Usuarios
                {
                    CodigoUsuario = dto.CodigoUsuario,
                    Clave = _fpsutilidades.EncriptarSHA256(dto.CodigoUsuario),
                    Identificacion = dto.Identificacion,
                    NombreCompleto = dto.NombreCompleto,
                    EsMasculino = dto.EsMasculino,
                    Telefono = dto.Telefono,
                    Direccion = dto.Direccion,
                    Correo = dto.Correo,
                    IdRol = dto.IdRol,
                    IdAgencia = dto.IdAgencia,
                    FechaRegistro = DateTime.Now,
                    UsuarioRegistro = dto.UsuarioRegistro,
                    EstaActivo = true
                };

                _fpscontext.Fps_Usuarios.Add(nuevoUsuario);
                await _fpscontext.SaveChangesAsync();

                // Crear el estado de login para el nuevo usuario
                var estadoLogin = new Fps_UsuariosLoginEstado
                {
                    IdUsuario = nuevoUsuario.IdUsuario,
                    IntentosFallidos = 0,
                    EstaBloqueado = false,
                    DebeCambiarClave = true,
                    BloqueadoHasta = null,
                    FechaUltimoLogin = null
                };

                _fpscontext.Fps_UsuariosLoginEstado.Add(estadoLogin);
                await _fpscontext.SaveChangesAsync();

                return Ok(new
                {
                    isSuccess = true,
                    message = "Usuario registrado correctamente.",
                    data = nuevoUsuario.IdUsuario
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "Error interno al crear el usuario.",
                    data = ex.Message
                });
            }
        }












        [HttpPut("EditarUsuario/{id}")]
        public async Task<IActionResult> EditarUsuario(int id, [FromBody] Fps_UsuarioUpdateDTO usuarioDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    isSuccess = false,
                    message = "Datos inválidos.",
                    data = (object?)null
                });
            }

            if (usuarioDto == null)
            {
                return BadRequest(new
                {
                    isSuccess = false,
                    message = "Los datos del usuario son requeridos.",
                    data = (object?)null
                });
            }

            var usuarioExistente = await _fpscontext.Fps_Usuarios.FindAsync(id);
            if (usuarioExistente == null)
            {
                return NotFound(new
                {
                    isSuccess = false,
                    message = $"No se encontró el usuario con ID {id}",
                    data = (object?)null
                });
            }

            // Validar que la identificación no esté en otro usuario (excepto el actual)
            var existeIdentificacion = await _fpscontext.Fps_Usuarios
                .AnyAsync(u => u.Identificacion == usuarioDto.Identificacion && u.IdUsuario != id);
            if (existeIdentificacion)
            {
                return Conflict(new
                {
                    isSuccess = false,
                    message = "Ya existe un usuario con esa identificación.",
                    data = (object?)null
                });
            }

            // Validar que el código de usuario no esté en otro usuario (excepto el actual)
            var existeCodigo = await _fpscontext.Fps_Usuarios
                .AnyAsync(u => u.CodigoUsuario == usuarioDto.CodigoUsuario && u.IdUsuario != id);
            if (existeCodigo)
            {
                return Conflict(new
                {
                    isSuccess = false,
                    message = "Ya existe un usuario con ese código.",
                    data = (object?)null
                });
            }

       
            usuarioExistente.CodigoUsuario = usuarioDto.CodigoUsuario;
            usuarioExistente.Identificacion = usuarioDto.Identificacion;
            usuarioExistente.NombreCompleto = usuarioDto.NombreCompleto;
            usuarioExistente.EsMasculino = usuarioDto.EsMasculino;
            usuarioExistente.Telefono = usuarioDto.Telefono;
            usuarioExistente.Direccion = usuarioDto.Direccion;
            usuarioExistente.Correo = usuarioDto.Correo;
            usuarioExistente.IdRol = usuarioDto.IdRol;
            usuarioExistente.IdAgencia = usuarioDto.IdAgencia;
            usuarioExistente.EstaActivo = usuarioDto.EstaActivo;
            usuarioExistente.FechaModificacion = DateTime.Now;
            usuarioExistente.UsuarioModificacion = usuarioDto.UsuarioModificacion;

            try
            {
                await _fpscontext.SaveChangesAsync();

                return Ok(new
                {
                    isSuccess = true,
                    message = "Usuario actualizado correctamente",
                    data = (object?)null
                });
            }
            catch (Exception ex)
            {
               

                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "Error al actualizar el usuario."
                });
            }
        }





        [HttpGet("ObtenerUsuarioDetalle/{id}")]
        public async Task<IActionResult> ObtenerUsuarioDetalle(int id)
        {
            try
            {
                var usuario = await _fpscontext.Fps_Usuarios
                    .Include(u => u.Roles)
                    .Include(u => u.Agencias)
                    .Where(u => u.IdUsuario == id)
                    .Select(u => new Fps_UsuarioDetalleDTO
                    {
                        IdUsuario = u.IdUsuario,
                        CodigoUsuario = u.CodigoUsuario,
                        Identificacion = u.Identificacion,
                        NombreCompleto = u.NombreCompleto,
                        EsMasculino = u.EsMasculino,
                        Telefono = u.Telefono,
                        Direccion = u.Direccion,
                        Correo = u.Correo,
                        IdRol = u.Roles.IdRol,
                        NombreRol = u.Roles.NombreRol,
                        IdAgencia = u.Agencias.IdAgencia,
                        NombreAgencia = u.Agencias.NombreAgencia,
                        UsuarioRegistro = u.UsuarioRegistro,
                        FechaRegistro = u.FechaRegistro,
                        FechaModificacion = u.FechaModificacion,
                        UsuarioModificacion = u.UsuarioModificacion,
                        EstaActivo = u.EstaActivo
                    })
                    .FirstOrDefaultAsync();

                if (usuario == null)
                    return NotFound(new { isSuccess = false, message = "Usuario no encontrado" });

                return Ok(new { isSuccess = true, data = usuario });
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { isSuccess = false, message = $"Error interno al obtener usuario: {ex.Message}" });
            }
        }




        [HttpGet("ListarUsuario")]
        public async Task<IActionResult> ListarUsuario()
       {
            try
            {
                var usuarios = await _fpscontext.Fps_Usuarios
                .Include(u => u.Roles)
                .Include(u => u.Agencias)
                .Select(u => new Fps_UsuarioDetalleDTO
                {
                    IdUsuario = u.IdUsuario,
                    CodigoUsuario = u.CodigoUsuario,
                    Identificacion = u.Identificacion,
                    NombreCompleto = u.NombreCompleto,
                    EsMasculino = u.EsMasculino,
                    Direccion = u.Direccion,
                    Telefono = u.Telefono,
                    Correo = u.Correo,
                    NombreRol = u.Roles.NombreRol,
                    NombreAgencia = u.Agencias.NombreAgencia,
                    FechaRegistro = u.FechaRegistro,
                    UsuarioRegistro = u.UsuarioRegistro,
                    FechaModificacion = u.FechaModificacion,
                    UsuarioModificacion = u.UsuarioModificacion,
                    EstaActivo = u.EstaActivo
                })
                .ToListAsync();

                return Ok(new { isSuccess = true, data = usuarios });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "Error al obtener usuarios",
                    detail = ex.Message
                });
            }
        }


        [HttpPost("ResetearClave/{idUsuario}")]
        public async Task<IActionResult> ResetearContrasena(int idUsuario)
        {
            try
            {
          
                var usuario = await _fpscontext.Fps_Usuarios.FindAsync(idUsuario);
                if (usuario == null)
                    return NotFound(new { isSuccess = false, message = "Usuario no encontrado." });

                usuario.Clave = _fpsutilidades.EncriptarSHA256(usuario.CodigoUsuario.ToUpper());


           
                var estadoLogin = await _fpscontext.Fps_UsuariosLoginEstado
                    .FirstOrDefaultAsync(e => e.IdUsuario == idUsuario);

           
                if (estadoLogin == null)
                {
                    estadoLogin = new Fps_UsuariosLoginEstado
                    {
                        IdUsuario = idUsuario,
                        IntentosFallidos = 0,
                        EstaBloqueado = false,
                        DebeCambiarClave = true 
                    };
                    _fpscontext.Fps_UsuariosLoginEstado.Add(estadoLogin);
                }
                else
                {
                   
                    estadoLogin.DebeCambiarClave = true;
                    estadoLogin.IntentosFallidos = 0;
                    estadoLogin.EstaBloqueado = false;
                    estadoLogin.BloqueadoHasta = null;
                }

                
                await _fpscontext.SaveChangesAsync();

                
                return Ok(new
                {
                    isSuccess = true,
                    message = "Contraseña reseteada. El usuario deberá cambiar su contraseña al ingresar."
                });
            }
            catch (Exception ex)
            {
              
                return StatusCode(500, new
                {
                    isSuccess = false,
                    message = "Error interno al resetear contraseña.",
                    detail = ex.Message
                });
            }
        }






    }
}
