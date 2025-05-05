using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace solardash.Server.Migrations
{
    public partial class TimescaleSetup : Migration
    {
        // Perform One-time Refresh manualy after this migration on pgAdmin - 
        // CALL refresh_continuous_aggregate('hourly_stats', NULL, NULL)
        // Where: hourly_stats - MATERIALIZED VIEW ; NULL, NULL - data range
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Enable the TimescaleDB extension (only once)
            migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS timescaledb;");

            // 2. Create pivoted “wide” table for raw measurements
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS measurements_wide (
                    time      timestamptz NOT NULL,    -- UTC timestamp
                    gpoa      double precision,        -- POA irradiance (W/m²), non-negative
                    power     double precision,        -- actual power (W)
                    bom_temp  double precision         -- back-of-module temperature (°C)
                );
            ");

            // 3. Load historical data if source exists:
            //    Only non-negative irradiance bc solar irradiance (W/m²) cannot be negative—there(if needed)
            //    Convert power_true_kw (kW) → W by multiplying by 1000 according to TA "“P = estimated power output (W)” 
            migrationBuilder.Sql(@"
                DO $$
                BEGIN
                  IF to_regclass('public.measurements') IS NOT NULL THEN
                    INSERT INTO measurements_wide (time, gpoa, power, bom_temp)
                    SELECT
                      timestamp AT TIME ZONE 'UTC' AS time,
                      MAX(CASE 
                            WHEN measure_name = 'irradiance_poa' AND value_double >= 0 
                              THEN value_double 
                            ELSE 0 
                          END) AS gpoa,
                      MAX(CASE 
                            WHEN measure_name = 'power_true_kw' 
                              THEN value_double * 1000 
                          END) AS power,
                      MAX(CASE 
                            WHEN measure_name = 'module_temperature' 
                              THEN value_double 
                          END) AS bom_temp
                    FROM public.measurements
                    GROUP BY timestamp AT TIME ZONE 'UTC';
                  END IF;
                END;
                $$;
            ");

            // 4. Convert to hypertable (1-day chunks)
            migrationBuilder.Sql(@"
                SELECT create_hypertable(
                  'measurements_wide', 
                  'time', 
                  chunk_time_interval => INTERVAL '1 day',
                  if_not_exists          => TRUE,
                  migrate_data           => TRUE
                );
            ");

            //// Safety cleanup in case table was created by mistake earlier
            //migrationBuilder.Sql("DROP TABLE IF EXISTS hourly_stats;");

           
            // 5. Define continuous‐aggregate for hourly KPIs (no initial data load)
            migrationBuilder.Sql(@"
                CREATE MATERIALIZED VIEW IF NOT EXISTS hourly_stats
                WITH (timescaledb.continuous)
                AS
                SELECT
                  time_bucket('1 hour', time)                                     AS hour,                -- hourly bucket
                  avg(power)                                                      AS avg_power,           -- avg actual power
                  max(gpoa)                                                       AS max_irradiance,      -- max POA
                  (4600000 * avg(gpoa)/1000 * (1 + (-0.0045)*(avg(bom_temp)-25))) AS avg_expected_power,  -- KPI
                  avg(power) - (4600000 * avg(gpoa)/1000 * (1 + (-0.0045)*(avg(bom_temp)-25))) 
                                                                                  AS avg_power_loss      -- loss
                FROM measurements_wide
                GROUP BY hour
                WITH NO DATA;                                                              -- avoid default WITH DATA
            ");

            // 6. Retention: drop raw older than 90 days
            migrationBuilder.Sql("SELECT add_retention_policy('measurements_wide', INTERVAL '90 days');");

            // 7. Refresh policy: keep hourly_stats up to date every hour
            migrationBuilder.Sql(@"
                SELECT add_continuous_aggregate_policy('hourly_stats',
                  start_offset      => INTERVAL '2 days',    -- how far back to refresh
                  end_offset        => INTERVAL '1 hour',    -- skip last hour
                  schedule_interval => INTERVAL '1 hour'     -- run each hour
                );
            ");

            // 8. Enable compression on the continuous aggregate
            migrationBuilder.Sql("ALTER MATERIALIZED VIEW hourly_stats SET (timescaledb.compress = true);");

            // 9. Compress chunks older than 7 days
            migrationBuilder.Sql("SELECT add_compression_policy('hourly_stats', INTERVAL '7 days');");

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Remove compression policy
            migrationBuilder.Sql("SELECT remove_compression_policy('hourly_stats');");

            // 2. Remove refresh policy
            migrationBuilder.Sql("SELECT remove_continuous_aggregate_policy('hourly_stats');");

            // 3. Remove raw data retention policy
            migrationBuilder.Sql("SELECT remove_retention_policy('measurements_wide');");

            // 4. Drop continuous‐aggregate view
            migrationBuilder.Sql("DROP MATERIALIZED VIEW IF EXISTS hourly_stats;");

            // 5. Drop base hypertable/table
            migrationBuilder.Sql("DROP TABLE IF EXISTS measurements_wide;");

            // 6. (Optional) Remove TimescaleDB extension
            // migrationBuilder.Sql("DROP EXTENSION IF EXISTS timescaledb;");
        }
    }
}