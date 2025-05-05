// Import necessary Angular and third-party modules
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { KpiService, KpiHourlyData } from '../../services/kpi.service';

// Define the component metadata
@Component({
  standalone: true,
  selector: 'app-kpi-chart',
  imports: [CommonModule, NgChartsModule],
  templateUrl: './kpi-chart.component.html',
  styleUrls: ['./kpi-chart.component.css']
})
export class KpiChartComponent implements OnInit {
  // Chart data to be displayed
  public chartData: ChartData<'line'> | null = null;

  // Chart configuration options
  public chartOptions: ChartOptions = {
    responsive: true, // Make the chart responsive
    interaction: { mode: 'index', intersect: false }, // Configure interaction mode
    plugins: {
      legend: { display: true }, // Display the legend
      tooltip: {
        mode: 'index', // Tooltip interaction mode
        intersect: false, // Allow tooltips to show for multiple datasets
        callbacks: {
          // Customize tooltip labels to display values in kW
          label: context => {
            const v = context.parsed.y as number;
            return `${context.dataset.label}: ${v.toFixed(2)} kW`;
          }
        }
      }
    },
    scales: {
      x: {
        // Configure x-axis ticks
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45, padding: 8 }
      },
      y: {
        // Configure left y-axis for power metrics
        position: 'left',
        title: { display: true, text: 'Power (kW)' },
        ticks: {
          // Format y-axis tick values
          callback: v => typeof v === 'number' ? `${v.toFixed(2)}` : ''
        }
      },
      y1: {
        // Configure right y-axis for irradiance metrics
        position: 'right',
        title: { display: true, text: 'Irradiance (W/m²)' },
        grid: { drawOnChartArea: false }, // Prevent grid lines from overlapping
        ticks: {
          // Format y1-axis tick values
          callback: v => (typeof v === 'number' && v < 0 ? '' : String(v))
        }
      }
    },
    layout: { padding: { top: 10, bottom: 10 } } // Add padding to the chart layout
  };

  // Define the chart type
  public chartType: ChartType = 'line';

  // Inject the KPI service to fetch data
  constructor(private kpiService: KpiService) { }

  // Lifecycle hook to initialize the component
  ngOnInit(): void {
    // Fetch hourly KPI data from the service
    this.kpiService.getHourlyData().subscribe({
      next: data => {
        // Normalize irradiance values to ensure they are non-negative
        const proc: KpiHourlyData[] = data.map(d => ({
          ...d,
          maxIrradiance: Math.max(0, d.maxIrradiance)
        }));

        // Convert power metrics from W to kW
        const procKw = proc.map(d => ({
          ...d,
          avgPower: (d.avgPower ?? 0) / 1000,
          avgExpectedPower: (d.avgExpectedPower ?? 0) / 1000,
          avgPowerLoss: (d.avgPowerLoss ?? 0) / 1000
        }));

        // Calculate axis boundaries for power and irradiance
        const maxPower = Math.max(
          ...procKw.map(d => d.avgPower),
          ...procKw.map(d => d.avgExpectedPower)
        ) * 1.1; // Add 10% margin
        const minLoss = Math.min(0, ...procKw.map(d => d.avgPowerLoss)) * 1.1; // Add 10% margin
        const maxIrr = Math.max(...proc.map(d => d.maxIrradiance)) * 1.1; // Add 10% margin

        // Adjust y-axis for power metrics
        this.chartOptions.scales!['y'] = {
          ...this.chartOptions.scales!['y'] as any,
          beginAtZero: false,
          min: minLoss,
          suggestedMax: maxPower
        };

        // Adjust y1-axis for irradiance metrics
        this.chartOptions.scales!['y1'] = {
          ...this.chartOptions.scales!['y1'] as any,
          beginAtZero: false,
          min: -((0 - minLoss) / (maxPower - minLoss)) * maxIrr / (1 - (0 - minLoss) / (maxPower - minLoss)),
          suggestedMax: maxIrr
        };

        // Generate labels for the x-axis based on hourly data
        const labels = procKw.map(d => {
          const dt = new Date(d.hour);
          return dt.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: 'UTC' });
        });

        // Populate chart datasets
        this.chartData = {
          labels,
          datasets: [
            {
              // Dataset for irradiance
              data: proc.map(d => d.maxIrradiance),
              label: 'POA Irradiance (W/m²)',
              yAxisID: 'y1',
              fill: true,
            },
            {
              // Dataset for actual power
              data: procKw.map(d => d.avgPower),
              label: 'Actual Power (kW)',
              yAxisID: 'y',
              fill: true,
            },
            {
              // Dataset for expected power
              data: procKw.map(d => d.avgExpectedPower),
              label: 'Expected Power (kW)',
              yAxisID: 'y',
              fill: true,
              borderColor: 'rgb(0,200,0)', // Bright green border
              backgroundColor: 'rgba(0,200,0,0.2)', // Semi-transparent fill
              pointBackgroundColor: 'rgb(0,200,0)', // Green points
            },
            {
              // Dataset for power loss
              data: procKw.map(d => d.avgPowerLoss),
              label: 'Power Loss (kW)',
              yAxisID: 'y',
              fill: true,
              borderColor: '#777777', // Gray border
              backgroundColor: 'rgba(119,119,119,0.2)', // Semi-transparent gray fill
              pointBackgroundColor: '#777777', // Gray points
            }
          ]
        };

      },
      // Log errors if data fetching fails
      error: err => console.error(err)
    });
  }
}
