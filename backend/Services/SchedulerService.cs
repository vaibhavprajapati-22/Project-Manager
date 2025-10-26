using ProjectManagerBackend.Dtos;

namespace ProjectManagerBackend.Services;

public interface ISchedulerService
{
    (bool Success, ScheduleResponseDto? Response, string? Error) GenerateSchedule(ScheduleRequestDto req);
}

public class SchedulerService : ISchedulerService
{
    public (bool Success, ScheduleResponseDto? Response, string? Error) GenerateSchedule(ScheduleRequestDto req)
    {
        if (req?.Tasks == null || req.Tasks.Count == 0)
            return (false, null, "No tasks provided.");

        var tasks = req.Tasks;
        var map = tasks.ToDictionary(t => t.Title, t => t);

        // ✅ Validate dependencies
        foreach (var t in tasks)
        {
            foreach (var dep in t.Dependencies)
            {
                if (!map.ContainsKey(dep))
                    return (false, null, $"Unknown dependency '{dep}' for task '{t.Title}'.");
            }
        }

        // Build graph
        var inDegree = tasks.ToDictionary(t => t.Title, _ => 0);
        var adj = tasks.ToDictionary(t => t.Title, _ => new List<string>());

        foreach (var t in tasks)
        {
            foreach (var dep in t.Dependencies)
            {
                adj[dep].Add(t.Title);
                inDegree[t.Title]++;
            }
        }

        // Priority queue (SortedSet) -> earlier due date first, then shorter estimated hours
        var comparer = Comparer<(DateTime Due, int Hours, string Title)>.Create((a, b) =>
        {
            int cmp = a.Due.CompareTo(b.Due);
            if (cmp != 0) return cmp;
            cmp = a.Hours.CompareTo(b.Hours);
            if (cmp != 0) return cmp;
            return string.Compare(a.Title, b.Title, StringComparison.Ordinal);
        });

        var pq = new SortedSet<(DateTime Due, int Hours, string Title)>(comparer);

        foreach (var t in tasks.Where(x => inDegree[x.Title] == 0))
            pq.Add((t.DueDate, t.EstimatedHours, t.Title));

        var order = new List<string>();

        while (pq.Count > 0)
        {
            var node = pq.Min!;
            pq.Remove(node);
            order.Add(node.Title);

            foreach (var nxt in adj[node.Title])
            {
                inDegree[nxt]--;
                if (inDegree[nxt] == 0)
                {
                    var task = map[nxt];
                    pq.Add((task.DueDate, task.EstimatedHours, task.Title));
                }
            }
        }

        if (order.Count != tasks.Count)
            return (false, null, "Cycle detected in task dependencies.");

        return (true, new ScheduleResponseDto { RecommendedOrder = order }, null);
    }
}
