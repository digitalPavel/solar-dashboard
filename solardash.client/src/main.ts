import { Chart, registerables } from 'chart.js';
// Register all controllers and plugins from Chart.js for ng2-charts
Chart.register(...registerables);

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// Bootstrap the Angular application with the AppModule
platformBrowserDynamic().bootstrapModule(AppModule, {
  // Enable event coalescing for better performance in Angular's NgZone
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err)); // Log any errors during the bootstrap process
