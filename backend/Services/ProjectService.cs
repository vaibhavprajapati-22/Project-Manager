using ProjectManagerBackend.Models;
using ProjectManagerBackend.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ProjectManagerBackend;
public interface IProjectService
{
    Task<List<Project>> GetProjectsForUser(int userId);
    Task<Project?> GetProject(int id, int userId);
    Task<Project> CreateProject(ProjectCreateDto dto, int userId);
    Task<bool> DeleteProject(int id, int userId);
}
public class ProjectService : IProjectService
{
    private readonly AppDbContext _db;
    public ProjectService(AppDbContext db) { _db = db; }
    public async Task<List<Project>> GetProjectsForUser(int userId) =>
        await _db.Projects.Include(p => p.Tasks).Where(p => p.OwnerId == userId).ToListAsync();
    public async Task<Project?> GetProject(int id, int userId) =>
        await _db.Projects.Include(p => p.Tasks).FirstOrDefaultAsync(p => p.Id == id && p.OwnerId == userId);
    public async Task<Project> CreateProject(ProjectCreateDto dto, int userId)
    {
        var p = new Project { Title = dto.Title, Description = dto.Description, OwnerId = userId };
        _db.Projects.Add(p);
        await _db.SaveChangesAsync();
        return p;
    }
    public async Task<bool> DeleteProject(int id, int userId)
    {
        var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id && x.OwnerId == userId);
        if (p == null) return false;
        _db.Projects.Remove(p);
        await _db.SaveChangesAsync();
        return true;
    }
}