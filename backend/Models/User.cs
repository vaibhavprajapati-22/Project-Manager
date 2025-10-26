using System.ComponentModel.DataAnnotations;
namespace ProjectManagerBackend.Models;
public class User
{
    public int Id { get; set; }
    [Required, MaxLength(100)]
    public string Username { get; set; } = null!;
    [Required]
    public string PasswordHash { get; set; } = null!;
    public List<Project> Projects { get; set; } = new();
}