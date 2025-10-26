namespace ProjectManagerBackend.Dtos;
public record ProjectCreateDto(string Title, string? Description);
public record ProjectDto(int Id, string Title, string? Description, DateTime CreatedAt);