import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BatchPerformance } from '../../services/batch-performance';
import { Utility } from '../../utility/data-store';

@Component({
  selector: 'app-home',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  isLoading = signal(false);
  selectedBatch = signal<any>({});

  private apiService = inject(ApiService);

  constructor() {
    this.selectedBatch.set(Utility.getBatches().filter((b: any) => b.isDefaultBatch == true)[0]);
    // console.log("OselectedBatchn constructor batch data", this.selectedBatch());
  }

  reloadBatchPerformance(batchId: any) {
    this.isLoading.set(true);
    this.apiService.getBatchPerformance(batchId).subscribe({
      next: (res: any) => {
        let batches = Utility.getBatches();
        let updatedBatches = batches.map((batch: any) => {
          if (batch.batchId == res.data.batchId) {
            return { ...batch, ...res.data }
          }
          return batch;
        })
        Utility.setBatches(updatedBatches);
        this.selectedBatch.set(updatedBatches.filter((b: any) => b.isDefaultBatch == true)[0]);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error("Header reload error", err?.error);
        this.isLoading.set(false);
      }
    });
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
