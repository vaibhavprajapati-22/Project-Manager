using Microsoft.AspNetCore.Mvc;
using ProjectManagerBackend.Dtos;

namespace ProjectManagerBackend.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) { _auth = auth; }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await _auth.Register(dto);
        if (result == null) return BadRequest(new { error = "UsernameTaken" });
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _auth.Login(dto);
        if (result == null) return Unauthorized();
        return Ok(result);
    }
}