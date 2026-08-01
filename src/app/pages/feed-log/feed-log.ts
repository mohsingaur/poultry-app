import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api-service';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-feed-log',
  imports: [DatePipe, FormRoot, FormField],
  templateUrl: './feed-log.html',
  styleUrl: './feed-log.scss',
})
export class FeedLog {
  isFormOpen = signal<boolean>(false);
  feedTypeMaster = signal<any[]>([]);
  batchId: string = '';
  companyId: string = '';
  isLoading: boolean = false;
  logEntries = signal<any[]>([]);

  // inject dependencies
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  feedLogModel = signal({
    receiptDate: new Date().toISOString().substring(0, 10),
    feedId: '',
    batchId: '',
    orderNumber: '',
    quantity: '',
    weightPerBag: '',
    totalFeedWeight: '',
    pricePerKg: '',
    driverName: '',
    driverContact: '',
    vehicleNumber: '',
    isActive: '',
  });

  feedLogForm = form(this.feedLogModel, (path) => {
    required(path.feedId, { message: "Feed type is required" });
    required(path.receiptDate, { message: "Receipt date is required" });
    required(path.quantity, { message: "Quantity is required" });
    required(path.weightPerBag, { message: "Weight per bag is required" });

  }, {
    submission: {
      action: async (field) => {
        let payload = field().value();
        payload.batchId = this.batchId;
        console.log(payload);
        this.postFeedEntry(payload);
      }
    }
  });

  toggleFormView(state?: boolean) {
    this.isFormOpen.set(typeof state === 'boolean' ? state : !this.isFormOpen());
  }

  constructor() {
    this.batchId = this.route.snapshot.queryParamMap.get('batchId') ?? '';
  }

  ngOnInit() {
    this.getFeedRecord();
    this.getFeedMaster();
  }

  getFeedMaster() {
    this.apiService.get('/feed/master', {}, (res: any) => {
      if (res.success) {
        // console.log("Feed master response", res.data);
        this.feedTypeMaster.set(res.data);
      }
    }, (err: any) => {
      console.log(err);
    });
  }

  getFeedRecord() {
    this.isLoading = true;
    this.apiService.get('/feed/receipt', { batchId: this.batchId }, (res: any) => {
      this.isLoading = false;
      // console.log("Get daily records", res.data);
      if (res.success) {
        res.data.sort((a: any, b: any) => Number(b.ageDays) - Number(a.ageDays));
        this.logEntries.set(res.data);
      }
    }, (err: any) => {
      this.isLoading = false;
      console.log(err);
    });
  }

  saveEntry() {
    if (this.feedLogModel().receiptDate && this.feedLogModel().batchId) {
      const parts = this.feedLogModel().receiptDate.split('-');
      const formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : this.feedLogModel().receiptDate;
      this.feedLogModel().receiptDate = formattedDate;

      this.logEntries.update(list => [
        {
          receiptDate: formattedDate,
          feedId: this.feedLogModel().feedId,
          orderNumber: this.feedLogModel().orderNumber,
          quantity: Number(this.feedLogModel().quantity || 0),
          weightPerBag: Number(this.feedLogModel().weightPerBag || 10),
          totalFeedWeight: Number(this.feedLogModel().totalFeedWeight || 0),
          pricePerKg: Number(this.feedLogModel().pricePerKg || 0),
          driverName: this.feedLogModel().driverName,
          driverContact: this.feedLogModel().driverContact,
          vehicleNumber: this.feedLogModel().vehicleNumber,
          isActive: this.feedLogModel().isActive,
        },
        ...list
      ]);

      this.toggleFormView(false);
    }
  }

  postFeedEntry(payload: any) {
    this.apiService.post('/feed/receipt', payload, (res: any) => {
      this.isLoading = false;
      if (res.success) {
        this.toggleFormView(false);
        this.getFeedRecord();
      }
    }, (err: any) => {
      this.isLoading = false;
      console.log(err);
    });
  }
}
