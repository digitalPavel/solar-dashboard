using Microsoft.EntityFrameworkCore;
using solardash.Server.Data;
public partial class Program
{
    /// <summary>
    /// Applies any pending EF Core migrations and refreshes the continuous aggregate.
    /// </summary>
    public static async Task MigrateAndRefreshAsync(WebApplication app)
    {
        await using var scope = app.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<SolarDbContext>();

        const int maxAttempts = 10;
        var attempt = 0;
        while (true)
        {
            try
            {
                // 1) Apply all pending migrations
                await db.Database.MigrateAsync();

                // 2) Refresh your continuous aggregate
                await db.Database.ExecuteSqlRawAsync(
                    "CALL refresh_continuous_aggregate('hourly_stats', NULL, NULL);"
                );
                break;
            }
            catch (Npgsql.NpgsqlException)
            {
                attempt++;
                if (attempt >= maxAttempts)
                    throw; // give up after 10 tries
                           // wait 5 seconds before retrying
                await Task.Delay(TimeSpan.FromSeconds(5));
            }
        }
    }
}