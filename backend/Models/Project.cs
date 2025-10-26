using System.ComponentModel.DataAnnotations;
namespace ProjectManagerBackend.Models;
public class Project
{
    public int Id { get; set; }
    [Required, MinLength(3), MaxLength(100)]
    public string Title { get; set; } = null!;
    [MaxLength(500)]
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int OwnerId { get; set; }
    public User? Owner { get; set; }
    public List<ProjectTask> Tasks { get; set; } = new();
}