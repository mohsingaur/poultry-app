import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register standard Chart.js components (animations, scales, legends, tooltips)
Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  imports: [],
  templateUrl: './chart.html',
  styleUrl: './chart.scss',
})
export class ChartComponent {
  @ViewChild('chartCanvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input({ required: true }) type!: ChartType;
  @Input({ required: true }) data!: ChartConfiguration['data'];
  @Input() options?: ChartConfiguration['options'];

  private chartInstance?: Chart;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If input data or configuration updates, refresh the chart instance without re-creating DOM
    // console.log("ChartComponent ngOnChanges", changes);
    if (this.chartInstance && (changes['data'] || changes['options'])) {
      this.chartInstance.data = this.data;
      if (this.options) {
        this.chartInstance.options = this.options;
      }
      this.chartInstance.update();
    }
  }

  private renderChart(): void {
    if (!this.canvasRef) return;

    // Destroy existing instance to prevent canvas re-use errors
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (ctx) {
      this.chartInstance = new Chart(ctx, {
        type: this.type,
        data: this.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...this.options
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
}
