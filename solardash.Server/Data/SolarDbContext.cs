using Microsoft.EntityFrameworkCore;
using solardash.Server.Models;

namespace solardash.Server.Data
{
    public class SolarDbContext : DbContext
    {
        // Represents the materialized view "hourly_stats" in the database
        public DbSet<HourlyStats> HourlyStats { get; set; }

        // Constructor used to pass options like the connection string from Program.cs
        public SolarDbContext(DbContextOptions<SolarDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Fluent API
            modelBuilder.Entity<HourlyStats>()
                .HasNoKey()                    // Because this is a materialized view and has no primary key
                .ToView("hourly_stats")  // Maps this entity to the SQL view named 'hourly_stats'
                .Metadata.SetIsTableExcludedFromMigrations(true);
        }        
    }
}