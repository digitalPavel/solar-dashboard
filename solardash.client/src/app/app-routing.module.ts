// Importing necessary modules from Angular core and router packages
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Defining an empty array of routes for the application
const routes: Routes = [];

// Declaring the AppRoutingModule as an Angular module
@NgModule({
  // Importing the RouterModule and configuring it with the defined routes
  imports: [RouterModule.forRoot(routes)],
  // Exporting the RouterModule to make it available throughout the application
  exports: [RouterModule]
})
// Exporting the AppRoutingModule class to be used in the application
export class AppRoutingModule { }
