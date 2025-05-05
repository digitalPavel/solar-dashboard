import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the structure of the expected KPI data from the API
export interface KpiHourlyData {
  hour: string;                // Hour of the day (e.g., "2025-05-01T14:00")
  avgPower: number;           // Average actual power generated
  maxIrradiance: number;      // Maximum irradiance measured
  avgExpectedPower: number;   // Average expected power based on GPOA
  avgPowerLoss: number;       // Average difference between expected and actual power
}

@Injectable({
  providedIn: 'root' // This service will be available globally in the app
})
export class KpiService {
  // API endpoint to get hourly KPI data
  private readonly apiUrl = '/api/kpi/hourly';

  // Injects Angular's HttpClient service into the class for making HTTP requests (e.g. GET, POST, etc.)
  constructor(private http: HttpClient) { }

  // Fetch KPI data 
  getHourlyData(): Observable<KpiHourlyData[]> {

  // Send GET request and expect an array of KPI hourly data
  return this.http.get<KpiHourlyData[]>(this.apiUrl);
  }
}
