// Importing the Component decorator from Angular core
import { Component } from '@angular/core';
// Importing the KpiChartComponent to be used in this component
import { KpiChartComponent } from './components/kpi-chart/kpi-chart.component';

@Component({
  // Declaring this component as standalone
  standalone: true,
  // Defining the selector for this component
  selector: 'app-root',
  // Specifying the components to be imported for use in this component
  imports: [KpiChartComponent],
  // Linking the HTML template for this component
  templateUrl: './app.component.html',
  // Linking the CSS styles for this component
  styleUrls: ['./app.component.css']
})
// Defining the AppComponent class
export class AppComponent { }
