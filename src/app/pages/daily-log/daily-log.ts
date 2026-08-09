import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { form, FormRoot, FormField, required } from '@angular/forms/signals';
import { Utility } from '../../utility/data-store';

@Component({
  selector: 'app-daily-log',
  imports: [DatePipe, FormRoot, FormField, DecimalPipe],
  templateUrl: './daily-log.html',
  styleUrl: './daily-log.scss',
})
export class DailyLog {
  isFormOpen = signal<boolean>(false);
  batchId: string = '';
  companyId: string = '';
  isLoading = signal<boolean>(false);
  logEntries = signal<any[]>([]);
  stdBags = signal(0);

  // inject dependencies
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  dailyLogModel = signal({
    uploadDate: new Date().toISOString().substring(0, 10),
    companyId: '',
    dailyMortality: '',
    dailyFeedBagsConsumed: '',
    dailyBodyWeight: '',
    noOfBirdsForWeight: 10,
    dailyWaterTanksConsumed: '',
    batchId: '',
  });

  dailyLogForm = form(this.dailyLogModel, (path) => {
    required(path.dailyBodyWeight, { message: 'Daily body weight is required' });
    required(path.dailyMortality, { message: 'Daily mortality is required' });
    required(path.dailyFeedBagsConsumed, { message: 'Daily feed bags consumed is required' });
    required(path.noOfBirdsForWeight, { message: 'Number of birds for weight is required' });
  }, {
    submission: {
      action: async (field) => {
        let payload = field().value();
        payload.batchId = this.batchId;
        payload.companyId = this.companyId || '1';
        console.log(payload);
        this.postDailyEntry(payload);
      }
    }
  });

  toggleFormView(state?: boolean) {
    this.isFormOpen.set(typeof state === 'boolean' ? state : !this.isFormOpen());
    if (this.isFormOpen()) {
      this.getStandardBagsConsumedToday();
    }
  }

  constructor() {
    this.batchId = this.route.snapshot.queryParamMap.get('batchId') ?? '';
  }

  ngOnInit() {
    this.getDailyBatchRecord();
  }

  getDailyBatchRecord() {
    this.isLoading.set(true);
    this.apiService.get('/log/daily/actual', { batchId: this.batchId }, (res: any) => {
      this.isLoading.set(false);
      // console.log("Get daily records", res.data);
      if (res.success) {
        res.data.sort((a: any, b: any) => Number(b.ageDays) - Number(a.ageDays));
        this.logEntries.set(res.data);
      }
    }, (err: any) => {
      this.isLoading.set(false);
      console.log(err);
    });
  }

  saveEntry() {
    if (this.dailyLogModel().uploadDate && this.dailyLogModel().batchId) {
      const parts = this.dailyLogModel().uploadDate.split('-');
      const formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : this.dailyLogModel().uploadDate;
      this.dailyLogModel().uploadDate = formattedDate;

      this.logEntries.update(list => [
        {
          uploadDate: formattedDate,
          dailyMortality: Number(this.dailyLogModel().dailyMortality || 0),
          dailyFeedBagsConsumed: Number(this.dailyLogModel().dailyFeedBagsConsumed || 0),
          dailyBodyWeight: Number(this.dailyLogModel().dailyBodyWeight || 0),
          noOfBirdsForWeight: Number(this.dailyLogModel().noOfBirdsForWeight || 10),
        },
        ...list
      ]);

      this.toggleFormView(false);
    }
  }

  postDailyEntry(payload: any) {
    this.isLoading.set(true);
    this.apiService.post('/log/daily/actual', payload, (res: any) => {
      this.isLoading.set(false);
      if (res.success) {
        this.toggleFormView(false);
        this.getDailyBatchRecord();
      }
    }, (err: any) => {
      this.isLoading.set(false);
      console.log(err);
    });
  }

  getStandardBagsConsumedToday(selectedDate?: string) {
    console.log("selectedDate", selectedDate);
    const batch = Utility.getBatches().find((item: any) => item.batchId == this.batchId);
    const startDate = batch.startDate;
    const liveBirdsStock = batch.liveBirdsStock;
    const weightPerBag = batch.weightPerBag;

    const today = new Date(selectedDate ?? Date.now()).getTime();
    const batchStartDate = new Date(startDate).getTime();

    // Difference in milliseconds
    const diffInMs = today - batchStartDate;

    // Convert ms to days and add 2 so the start date and end date counts as 2 Days
    const day = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 2;

    const todayFeedIntake = Utility.getStandardData().find((item: any) => item.ageDays == day)?.standardFeedIntake;
    if (todayFeedIntake && day > 0) {
      let bagsConsumed = (Number(todayFeedIntake) * Number(liveBirdsStock)) / (1000 * Number(weightPerBag));
      this.stdBags.set(bagsConsumed);
    }
    else {
      this.stdBags.set(0);
    }

  }

}
