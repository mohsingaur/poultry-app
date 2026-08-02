import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Utility } from '../utility/data-store';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3004/api/v1';
  // private readonly baseUrl = 'https://saspf-server-zm7y.onrender.com/api/v1';
  private readonly http = inject(HttpClient);

  getBatchPerformance(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/log/daily/actual/refresh/${id}`);
  }

  getDefaultBatch() {
    let batches = Utility.getBatches();
    if (batches.length === 0) {
      return null;
    }
    let batch = batches.filter((b: any) => b.isDefaultBatch == true);
    if (batch.length > 0) {
      return batch[0];
    } else {
      return batches[0];
    }
  }

  get(endPoint: string, queryParams: any = null, res?: any, err?: any) {
    this.http.get(`${this.baseUrl}${endPoint}`, { params: queryParams })
      .subscribe({
        next: (response: any) => {
          return res(response);
        },
        error: (error: any) => {
          return err(error.error);
        }
      });
  }

  post(endPoint: string, payload: any, res?: any, err?: any) {
    this.http.post(`${this.baseUrl}${endPoint}`, payload)
      .subscribe({
        next: (response: any) => {
          return res(response);
        },
        error: (error: any) => {
          return err(error.error);
        }
      })
  }

  patch(endPoint: string, payload: any, res?: any, err?: any) {
    this.http.patch(`${this.baseUrl}${endPoint}`, payload)
      .subscribe({
        next: (response: any) => {
          return res(response);
        },
        error: (error: any) => {
          return err(error.error);
        }
      });
  }

  delete(endPoint: string, queryParams: any = null, res?: any, err?: any) {
    this.http.delete(`${this.baseUrl}${endPoint}`, { params: queryParams })
      .subscribe({
        next: (response: any) => {
          return res(response);
        },
        error: (error: any) => {
          return err(error.error);
        }
      })
  }
}
