using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.EntityFrameworkCore;
using solardash.Server.Data;
using solardash.Server;

var builder = WebApplication.CreateBuilder(args);

// Register SolarDbContext and configure PostgreSQL connection
// This allows EF Core to connect to PostgreSQL using connection string from appsettings.json. Scope by default
builder.Services.AddDbContext<SolarDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add support for minimal API endpoint discovery
builder.Services.AddEndpointsApiExplorer();

#region SwaggerGen Initialization: Generate OpenAPI/Swagger JSON

// This registers Swagger generation and allows you to browse API via Swagger UI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "☀Solar KPI API",
        Version = "v1",
        Description = "API for retrieving POA, Power, Expected Power, and Loss"
    });
});

#endregion

var app = builder.Build();

await MigrateAndRefreshAsync(app);


// Serve Angular static files (index.html, scripts, styles)
app.UseDefaultFiles();
app.UseStaticFiles();            // StaticFiles

#region Swagger UI Configuration (enabled in all environments)

// Enable Swagger middleware to generate JSON and UI endpoints
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Solar API v1");
    c.RoutePrefix = "swagger"; // UI will be at /swagger
});

#endregion

//app.UseHttpsRedirection(); // Force HTTPS 

#region Minimal API endpoint
// Minimal API endpoint to return KPI data from hourly_stats
// Accepts optional start and end query parameters to filter by datetime range(UTC).
app.MapGet("/api/kpi/hourly", async (
    //[FromQuery] DateTimeOffset? start,
    //[FromQuery] DateTimeOffset? end,
    SolarDbContext dbContext) =>
{
    WriteLine("Received request for /api/kpi/hourly");
    //Console.WriteLine($"Start: {start}, End: {end}");

    #region Querying data if needed 

    // Default range: last 2 days
    //var from = start?.UtcDateTime ?? DateTime.UtcNow.AddDays(-2);
    //var to = end?.UtcDateTime ?? DateTime.UtcNow;

    // Validate date range: start must be before end
    //if (from > to)
    //{
    //    Console.WriteLine("Invalid date range: start is after end");
    //    return Results.BadRequest("Start date must be earlier than end date.");
    //}

    //Console.WriteLine($"Querying data from {from} to {to}");

    #endregion

    // Query hourly_stats materialized view using LINQ with filtering and ordering
    var data = await dbContext.HourlyStats
        .AsNoTracking() // Disable change tracking to increase perfomance 
                        //.Where(h => h.Hour >= from && h.Hour <= to) 
        .OrderBy(h => h.Hour)
        .ToListAsync();


    WriteLine($"Returned {data.Count} records");

    // Return 200 OK with JSON of KPI data
    return Results.Ok(data);
})
.WithName("GetHourlyKpi")  // Optional name for routing/links
.WithTags("KPI");  // Appears under 'KPI' section in Swagger

#endregion

// Serve Angular fallback for SPA routing (e.g., /dashboard -> index.html)
app.MapFallbackToFile("/index.html");

// Start the app
app.Run();
