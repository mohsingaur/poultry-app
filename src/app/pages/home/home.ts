import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  isLoading = signal(false);
  batch = signal<any>({});
  apiService = inject(ApiService);

  constructor() {
    let b = this.apiService.getDefaultBatch();
    this.batch.set(b);
    // console.log("On constructor batch data", this.batch());
  }

  refreshBatchPerformance(batchId: any) {
    this.isLoading.set(true);
    this.apiService.getBatchPerformance(batchId).subscribe(
      (res: any) => {
        this.batch.set(res.data);
        console.log("On refresh call batch data", this.batch());
        this.isLoading.set(false);
      }, (err: any) => {
        this.isLoading.set(false);
      }
    )
  }

  getAgeInDays(startDate: Date | string, endDate?: Date | string): number {
    if (!startDate) return 0;

    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : new Date().getTime();

    // Difference in milliseconds
    const diffInMs = Math.abs(end - start);

    // Convert ms to days and add 1 so the start date counts as Day 1
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
  }

}
