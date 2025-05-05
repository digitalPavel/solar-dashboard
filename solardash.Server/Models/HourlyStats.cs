using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace solardash.Server.Models
{
    [Keyless]                           
    [Table("hourly_stats")]         
    public class HourlyStats
    {
        [Column("hour")]
        public DateTime Hour { get; set; }               // time_bucket('1 hour', time)

        [Column("avg_power")]
        public double? AvgPower { get; set; }            // avg(power)
        
        [Column("max_irradiance")]
        public double? MaxIrradiance { get; set; }       // max(gpoa)
       
        [Column("avg_expected_power")]
        public double? AvgExpectedPower { get; set; }    // KPI

        [Column("avg_power_loss")]
        public double? AvgPowerLoss { get; set; }        // power loss
    }
}
