using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManagerBackend.Dtos;
using System.Security.Claims;

namespace ProjectManagerBackend.Controllers;
[ApiController]
[Route("api")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _svc;
    public TasksController(ITaskService svc) { _svc = svc; }
    private int UserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpPost("projects/{projectId}/tasks")]
    public async Task<IActionResult> Add(int projectId, TaskCreateDto dto)
    {
        var t = await _svc.AddTask(projectId, dto, UserId());
        if (t == null) return NotFound();
        return Ok(new Dtos.TaskDto(t.Id, t.Title, t.DueDate, t.IsCompleted, t.ProjectId));
    }

    [HttpPut("tasks/{taskId}")]
    public async Task<IActionResult> Update(int taskId, TaskCreateDto dto, [FromQuery] bool? toggle)
    {
        var t = await _svc.UpdateTask(taskId, dto, toggle, UserId());
        if (t == null) return NotFound();
        return Ok(new Dtos.TaskDto(t.Id, t.Title, t.DueDate, t.IsCompleted, t.ProjectId));
    }

    [HttpDelete("tasks/{taskId}")]
    public async Task<IActionResult> Delete(int taskId)
    {
        if (!await _svc.DeleteTask(taskId, UserId())) return NotFound();
        return NoContent();
    }
}