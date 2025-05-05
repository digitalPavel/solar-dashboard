import { BrowserModule } from '@angular/platform-browser'; // Provides browser-specific services
import { NgModule } from '@angular/core'; // Core Angular module decorator
import { HttpClientModule } from '@angular/common/http';  // Enables HTTP communication
import { AppRoutingModule } from './app-routing.module'; // Configures application routes
import { AppComponent } from './app.component';  // Root component of the application
import { KpiChartComponent } from './components/kpi-chart/kpi-chart.component'; // Component for displaying KPI charts

// Defining the Angular module
@NgModule({

  imports: [
    BrowserModule,       // Provides browser-specific services
    HttpClientModule,    // Enables HTTP communication
    AppRoutingModule,    // Configures application routes

    AppComponent,        // Registers the standalone root component
  KpiChartComponent    // Registers the standalone KPI chart component
  ],
  providers: [],         // No additional services are provided here
  bootstrap: [AppComponent] // Bootstraps the application with the root component

})
export class AppModule { } // Defines the root module of the Angular application
