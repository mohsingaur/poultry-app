import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { ActivatedRoute } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { Utility } from '../../utility/data-store';

@Component({
  selector: 'app-standard-log',
  imports: [],
  templateUrl: './standard-log.html',
  styleUrl: './standard-log.scss',
})
export class StandardLog {

  isFormOpen = signal<boolean>(false);
  feedTypeMaster = signal<any[]>([]);
  batchId: string = '';
  companyId: string = '';
  isLoading: boolean = false;
  logEntries = signal<any[]>([]);

  // inject dependencies
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  standardDataModel = signal({
    companyId: '',
    file: '',
  });

  standardDataForm = form(this.standardDataModel, (path) => {
    required(path.file, { message: "File is required" });

  }, {
    submission: {
      action: async (field) => {
        let payload = field().value();
        payload.companyId = this.companyId;
        console.log(payload);
        this.uploadStdEntry(payload);
      }
    }
  });

  toggleFormView(state?: boolean) {
    this.isFormOpen.set(typeof state === 'boolean' ? state : !this.isFormOpen());
  }

  constructor() {
    this.batchId = this.route.snapshot.queryParamMap.get('batchId') ?? '';
    let batches = Utility.getBatches();
    if (batches.length > 0) {
      let batch = batches.find((b: any) => b.batchId == this.batchId);
      this.companyId = batch?.companyId;
    }
  }

  ngOnInit() {
    this.getStdRecord();
  }

  getStdRecord() {
    this.isLoading = true;
    this.apiService.get('/log/daily/standard', { companyId: this.companyId }, (res: any) => {
      this.isLoading = false;
      // console.log("Get daily records", res.data);
      if (res.success) {
        this.logEntries.set(res.data);
      }
    }, (err: any) => {
      this.isLoading = false;
      console.log(err);
    });
  }

  saveEntry() {
    this.toggleFormView(false);
  }

  uploadStdEntry(payload: any) {
    this.apiService.post('/feed/receipt', payload, (res: any) => {
      this.isLoading = false;
      if (res.success) {
        this.toggleFormView(false);
        this.getStdRecord();
      }
    }, (err: any) => {
      this.isLoading = false;
      console.log(err);
    });
  }

}
