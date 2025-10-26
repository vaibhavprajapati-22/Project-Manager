using System.ComponentModel.DataAnnotations;

namespace ProjectManagerBackend.Dtos;

public class TaskInputDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public int EstimatedHours { get; set; }

    [Required]
    public DateTime DueDate { get; set; }

    public List<string> Dependencies { get; set; } = new();
}

public class ScheduleRequestDto
{
    [Required]
    public List<TaskInputDto> Tasks { get; set; } = new();
}

public class ScheduleResponseDto
{
    public List<string> RecommendedOrder { get; set; } = new();
}

public class ScheduleErrorDto
{
    public string Error { get; set; } = string.Empty;
}
