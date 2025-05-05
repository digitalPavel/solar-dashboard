// Import necessary modules for testing
import { TestBed } from '@angular/core/testing';
// Import the service to be tested
import { KpiService } from './kpi.service';

// Define a test suite for the KpiService
describe('KpiService', () => {
  let service: KpiService; // Declare a variable to hold the service instance

  // Run before each test to set up the testing environment
  beforeEach(() => {
    // Configure the testing module
    TestBed.configureTestingModule({});
    // Inject the KpiService into the test
    service = TestBed.inject(KpiService);
  });

  // Test to check if the service is created successfully
  it('should be created', () => {
    expect(service).toBeTruthy(); // Assert that the service instance exists
  });
});
