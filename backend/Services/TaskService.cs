using ProjectManagerBackend.Models;
using ProjectManagerBackend.Dtos;
using Microsoft.EntityFrameworkCore;

namespace ProjectManagerBackend;
public interface ITaskService
{
    Task<ProjectTask?> AddTask(int projectId, TaskCreateDto dto, int userId);
    Task<ProjectTask?> UpdateTask(int taskId, TaskCreateDto dto, bool? toggleComplete, int userId);
    Task<bool> DeleteTask(int taskId, int userId);
}
public class TaskService : ITaskService
{
    private readonly AppDbContext _db;
    public TaskService(AppDbContext db) { _db = db; }
    public async Task<ProjectTask?> AddTask(int projectId, TaskCreateDto dto, int userId)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.OwnerId == userId);
        if (project == null) return null;
        var t = new ProjectTask { Title = dto.Title, DueDate = dto.DueDate, ProjectId = projectId };
        _db.ProjectTasks.Add(t);
        await _db.SaveChangesAsync();
        return t;
    }
    public async Task<ProjectTask?> UpdateTask(int taskId, TaskCreateDto dto, bool? toggleComplete, int userId)
    {
        var t = await _db.ProjectTasks.Include(x => x.Project).FirstOrDefaultAsync(x => x.Id == taskId && x.Project!.OwnerId == userId);
        if (t == null) return null;
        if (!string.IsNullOrWhiteSpace(dto.Title)) t.Title = dto.Title;
        t.DueDate = dto.DueDate;
        if (toggleComplete.HasValue) t.IsCompleted = toggleComplete.Value;
        await _db.SaveChangesAsync();
        return t;
    }
    public async Task<bool> DeleteTask(int taskId, int userId)
    {
        var t = await _db.ProjectTasks.Include(x => x.Project).FirstOrDefaultAsync(x => x.Id == taskId && x.Project!.OwnerId == userId);
        if (t == null) return false;
        _db.ProjectTasks.Remove(t);
        await _db.SaveChangesAsync();
        return true;
    }
}