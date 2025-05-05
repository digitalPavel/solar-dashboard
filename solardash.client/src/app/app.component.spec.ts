import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { KpiChartComponent } from './components/kpi-chart/kpi-chart.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, KpiChartComponent],
      imports: []
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the KPI chart component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const chartEl = compiled.querySelector('app-kpi-chart');
    expect(chartEl).toBeTruthy();
  });
});
