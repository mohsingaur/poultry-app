import { Injectable, signal } from '@angular/core';
import { Utility } from '../utility/data-store';

@Injectable({
  providedIn: 'root',
})
export class BatchPerformance {

  // Load initial data from Local storage and create Signal
  private batchesSignal = signal<any[]>(this.loadFromStorage());

  // read-only signal getter for components
  readonly batches = this.batchesSignal.asReadonly();

  private loadFromStorage(): any[] {
    const data = Utility.getBatches();
    return data || [];
  }

  // Central Method to update the batches
  updateBatch(updatedBatchData: any) {
    this.batchesSignal.update((currentBatches) => {
      const updatedList = currentBatches.map((b) =>
        b.batchId == updatedBatchData.batchId ? { ...b, ...updatedBatchData } : b
      );

      // Local Storage update
      Utility.setBatches(updatedList);

      // New updated array returned to Signal
      return updatedList;
    });
  }
}
