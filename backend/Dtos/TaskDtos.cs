namespace ProjectManagerBackend.Dtos;
public record TaskCreateDto(string Title, DateTime? DueDate);
public record TaskDto(int Id, string Title, DateTime? DueDate, bool IsCompleted, int ProjectId);