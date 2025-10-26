using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagerBackend.Dtos;
using ProjectManagerBackend.Services;
using System.Security.Claims;

namespace ProjectManagerBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _svc;
    private readonly IAuthService _auth;
    private readonly ISchedulerService _scheduler;

    public ProjectsController(IProjectService svc, IAuthService auth, ISchedulerService scheduler)
    {
        _svc = svc;
        _auth = auth;
        _scheduler = scheduler;
    }

    private int UserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(
        (await _svc.GetProjectsForUser(UserId()))
            .Select(p => new {
                p.Id,
                p.Title,
                p.Description,
                p.CreatedAt,
                tasks = p.Tasks.Select(t => new Dtos.TaskDto(
                    t.Id,
                    t.Title,
                    t.DueDate,
                    t.IsCompleted,
                    t.ProjectId
                ))
            })
    );

    [HttpPost]
    public async Task<IActionResult> Create(ProjectCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || dto.Title.Length < 3) return BadRequest("Invalid title");
        var p = await _svc.CreateProject(dto, UserId());
        return Ok(new Dtos.ProjectDto(p.Id, p.Title, p.Description, p.CreatedAt));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOne(int id)
    {
        var p = await _svc.GetProject(id, UserId());
        if (p == null) return NotFound();
        return Ok(new { p.Id, p.Title, p.Description, p.CreatedAt, tasks = p.Tasks.Select(t => new Dtos.TaskDto(t.Id, t.Title, t.DueDate, t.IsCompleted, t.ProjectId)) });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await _svc.DeleteProject(id, UserId())) return NotFound();
        return NoContent();
    }

     [HttpPost("{projectId}/schedule")]
    public IActionResult SmartSchedule(int projectId, [FromBody] ScheduleRequestDto req)
    {
        var (success, response, error) = _scheduler.GenerateSchedule(req);
        if (!success) return BadRequest(new ScheduleErrorDto { Error = error ?? "Invalid input." });
        return Ok(response);
    }
}