import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { ActivatedRoute } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { Utility } from '../../utility/data-store';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-standard-log',
  imports: [DecimalPipe],
  templateUrl: './standard-log.html',
  styleUrl: './standard-log.scss',
})
export class StandardLog {

  isFormOpen = signal<boolean>(false);
  feedTypeMaster = signal<any[]>([]);
  batchId: string = '';
  companyId: string = '';
  isLoading = signal<boolean>(false);
  logEntries = signal<any[]>([]);
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string | null>(null);
  uploadSuccess = signal(false);
  uploadError = signal<string | null>(null);
  isUploading = signal(false);
  liveBirdsStock = signal(0);

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
      this.liveBirdsStock.set(batch?.liveBirdsStock);
    }
  }

  ngOnInit() {
    this.getStdRecord();
  }

  getStdRecord() {
    this.isLoading.set(true);
    this.apiService.get('/log/daily/standard', { companyId: this.companyId }, (res: any) => {
      this.isLoading.set(false);
      // console.log("Get daily records", res.data);
      if (res.success) {
        this.logEntries.set(res.data);
      }
    }, (err: any) => {
      this.isLoading.set(false);
      console.log(err);
    });
  }

  saveEntry() {
    this.toggleFormView(false);
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file) {
      this.selectedFile.set(file);
      this.selectedFileName.set(file.name);
      console.log("Selected file:", file);
    }
  }

  uploadExcel() {
    const file = this.selectedFile();
    if (!file) {
      console.warn('No file selected for upload.');
      return;
    }
    this.isLoading.set(true);
    const formData = new FormData();
    formData.append('companyId', this.companyId);
    formData.append('file', file, file.name);

    // formData.forEach((value, key) => console.log(key, value));

    this.uploadStdEntry(formData);
  }

  uploadStdEntry(payload: FormData) {
    this.apiService.post('/log/daily/standard/upload', payload, (res: any) => {
      this.isLoading.set(false);
      if (res.success) {
        this.toggleFormView(false);
        this.getStdRecord();
      }
    }, (err: any) => {
      this.isLoading.set(false);
      console.error('Upload failed:', err);
    });
  }

}
