import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { form, FormRoot, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-daily-log',
  imports: [DatePipe, FormRoot, FormField],
  templateUrl: './daily-log.html',
  styleUrl: './daily-log.scss',
})
export class DailyLog {
  isFormOpen = signal<boolean>(false);
  batchId: string = '';
  companyId: string = '';
  isLoading = signal<boolean>(false);
  logEntries = signal<any[]>([]);

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
    console.log("state", state);
    this.isFormOpen.set(typeof state === 'boolean' ? state : !this.isFormOpen());
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

}
