using ProjectManagerBackend.Models;
using ProjectManagerBackend.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ProjectManagerBackend;
public interface IAuthService
{
    Task<AuthResult?> Register(RegisterDto dto);
    Task<AuthResult?> Login(LoginDto dto);
    Task<User?> GetUserFromClaims(ClaimsPrincipal user);
}

public class AuthService : IAuthService
{
    private readonly Models.AppDbContext _db;
    private readonly IConfiguration _cfg;
    public AuthService(Models.AppDbContext db, IConfiguration cfg) { _db = db; _cfg = cfg; }
    private static string Hash(string pwd)
    {
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(pwd)));
    }
    public async Task<AuthResult?> Register(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username)) return null;
        var user = new User { Username = dto.Username, PasswordHash = Hash(dto.Password) };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return await CreateToken(user);
    }
    public async Task<AuthResult?> Login(LoginDto dto)
    {
        var hash = Hash(dto.Password);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username && u.PasswordHash == hash);
        if (user == null) return null;
        return await CreateToken(user);
    }
    private Task<AuthResult> CreateToken(User user)
    {
        var key = Encoding.UTF8.GetBytes(_cfg["Jwt:Key"] ?? "ChangeThisSecretToSomethingLong");
        var tokenHandler = new JwtSecurityTokenHandler();
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.Username) };
        var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddDays(7), signingCredentials: creds);
        return Task.FromResult(new AuthResult(tokenHandler.WriteToken(token)));
    }
    public async Task<User?> GetUserFromClaims(ClaimsPrincipal user)
    {
        var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (id == null) return null;
        return await _db.Users.FindAsync(int.Parse(id));
    }
}