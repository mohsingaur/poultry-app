import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api-service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BatchPerformance } from '../../services/batch-performance';
import { Utility } from '../../utility/data-store';
import { ChartComponent } from "../chart/chart";

@Component({
  selector: 'app-home',
  imports: [DatePipe, DecimalPipe, ChartComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  isLoading = signal(false);
  isDashboardLoading = signal(false);
  selectedBatch = signal<any>({});
  chartsData = signal<any[]>([]);

  private apiService = inject(ApiService);

  constructor() {
    this.selectedBatch.set(Utility.getBatches().filter((b: any) => b.isDefaultBatch == true)[0]);
    // console.log("OselectedBatchn constructor batch data", this.selectedBatch());
  }

  ngOnInit() {
    this.getDashBoard();
  }

  reloadBatchPerformance(batchId: any) {
    this.getDashBoard();
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

  getDashBoard() {
    this.isDashboardLoading.set(true);
    this.apiService.get("/dashboard", { batchId: this.selectedBatch().batchId }, (res: any) => {
      this.isDashboardLoading.set(false);
      // console.log("Get dashboard data", res.data);
      const data = this.transformDashboardData(res);
      // console.log("Transformed dashboard data", data);
      this.chartsData.set(data.chartsData);
    }, (err: any) => {
      this.isDashboardLoading.set(false);
      console.log(err);
    });
  }

  getAgeInDays(startDate: Date | string, endDate?: Date | string): number {
    if (!startDate) return 0;

    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : new Date().getTime();

    // Difference in milliseconds
    const diffInMs = Math.abs(end - start);

    // Convert ms to days and add 1 so the start date counts as Day 1
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 2;
  }

  /**
 * Transforms the raw API response into the dashboard display format.
 * @param {Object} apiResponse - The full API response object.
 * @return {Object} The formatted dashboard data object.
 */
  transformDashboardData(apiResponse: any): any {
    if (!apiResponse || !Array.isArray(apiResponse.data) || apiResponse.data.length === 0) {
      return null;
    }

    const rawList = apiResponse.data;

    // Get the latest day record (assumes data is ordered by ageDays/date, or pick last element)
    const latestRecord = rawList[rawList.length - 1];

    // 1. Construct Cards using latest record metrics
    const housedChicks = Number(latestRecord.housedChicks) || 0;
    const cumulativeMortality = Number(latestRecord.cumulativeMortality) || 0;
    const mortalityPercentage = housedChicks > 0
      ? Number(((cumulativeMortality / housedChicks) * 100).toFixed(2))
      : 0;

    const cards = [
      {
        title: 'Age',
        matIcon: 'calendar_today',
        category: 'Chicks Management',
        value: Number(latestRecord.ageDays) || 0,
        heatValue: 0,
        unit: 'days'
      },
      {
        title: 'Housed Chicks',
        matIcon: 'home',
        category: 'Chicks Management',
        value: housedChicks,
        heatValue: 0,
        unit: '#'
      },
      {
        title: 'Live Bird stock',
        matIcon: 'groups',
        category: 'Chicks Management',
        value: Number(latestRecord.liveBirds) || 0,
        heatValue: 0,
        unit: '#'
      },
      {
        title: 'Mortality',
        matIcon: 'error',
        category: 'Chicks Management',
        value: cumulativeMortality,
        heatValue: mortalityPercentage > 7.5 ? 100 : (mortalityPercentage * 13.33).toFixed(0),
        unit: '#',
        percentValue: mortalityPercentage
      },

      {
        title: 'Average Body Weight',
        matIcon: 'line_weight',
        category: 'Chicks Management',
        value: Number(latestRecord.dailyActualBodyWeightGms) || 0,
        heatValue: 0,
        unit: 'g'
      },
      {
        title: 'FCR',
        matIcon: 'fastfood',
        category: 'Chicks Management',
        value: Number(latestRecord.actualFCR) || 0,
        heatValue: 0,
        unit: null
      },
      {
        title: 'Feed Consumed',
        matIcon: 'fastfood',
        category: 'Feed Management',
        value: Number(latestRecord.totalBagsConsumed) || 0,
        heatValue: 0,
        unit: 'bags'
      },
      {
        title: 'Feed Stock',
        matIcon: 'fastfood',
        category: 'Feed Management',
        value: Number(latestRecord.closingFeedStock) || 0,
        heatValue: 0,
        unit: 'bags'
      }
    ];

    // 2. Extract Farm Details from the latest record
    const farmDetails = {
      farmerId: latestRecord.farmerId,
      farmId: latestRecord.farmId,
      batchId: latestRecord.batchId,
      farmerName: latestRecord.farmerName,
      farmName: latestRecord.farmName,
      farmCode: latestRecord.farmCode,
      farmStatus: latestRecord.farmStatus,
      batchCode: latestRecord.batchCode,
      batchStatus: latestRecord.batchStatus,
      contractWith: latestRecord.contractWith,
      housedChicks: latestRecord.housedChicks,
      liveBirds: latestRecord.liveBirds
    };

    // 3. Map Tabular Data
    const tabularData = rawList.map((item: any) => ({
      dailyFarmRecordId: item.dailyFarmRecordId,
      feedReceiptDate: item.feedReceiptDate,
      feedBagsQuantity: item.feedBagsQuantity,
      weightPerBag: item.weightPerBag,
      totalFeedWeightKgs: item.totalFeedWeightKgs,
      pricePerKg: item.pricePerKg,
      totalFeedPrice: item.totalFeedPrice,
      uploadDate: item.uploadDate,
      ageDays: item.ageDays,
      dailyFeedBagsConsumed: item.dailyFeedBagsConsumed,
      dailyMortality: item.dailyMortality,
      cumulativeMortality: item.cumulativeMortality,
      dailyActualFeedIntakeGms: item.dailyActualFeedIntakeGms,
      dailyStandardFeedIntakeGms: item.dailyStandardFeedIntakeGms,
      dailyActualBodyWeightGms: item.dailyActualBodyWeightGms,
      dailyStdBodyWeightGms: item.dailyStdBodyWeightGms,
      dailyFCR: item.dailyFCR,
      actualFCR: item.actualFCR,
      standardFCR: item.standardFCR,
      totalBagsConsumed: item.totalBagsConsumed,
      closingFeedStock: item.closingFeedStock
    }));

    // 4. Construct Charts Data
    const categories = rawList.map((item: any) => item.ageDays).sort((a: any, b: any) => a - b);

    const chartsData = [{
      chartTitle: 'FCR',
      type: 'line',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Standard',
            data: rawList.map((item: any) => Number(item.standardFCR) || 0),
            backgroundColor: '#37115fff',
            borderColor: '#115f13',
            borderWidth: 1,
            tension: 0.4,
            fill: false,
            pointRadius: 2
          },
          {
            label: 'Actual',
            data: rawList.map((item: any) => Number(item.actualFCR) || 0),
            backgroundColor: '#ff2d2d',
            borderColor: '#ff2d2d',
            borderWidth: 1,
            tension: 0.4,
            fill: false,
            pointRadius: 2
          }
        ]
      },
    },
    {
      chartTitle: 'Feed Intake (gms)',
      type: 'line',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Standard',
            data: rawList.map((item: any) => Number(item.dailyStandardFeedIntakeGms) || 0),
            backgroundColor: '#115f13',
            borderColor: '#115f13',
            borderWidth: 1,
            tension: 0.4,
            fill: false,
            pointRadius: 2
          },
          {
            label: 'Actual',
            data: rawList.map((item: any) => Number(item.dailyActualFeedIntakeGms) || 0),
            backgroundColor: '#ff2d2d',
            borderColor: '#ff2d2d',
            borderWidth: 1,
            tension: 0.4,
            fill: false,
            pointRadius: 2
          }
        ]
      },
    },
    {
      chartTitle: 'Mortality #',
      type: 'line',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Daily Mortality',
            data: rawList.map((item: any) => Number(item.dailyMortality) || 0),
            backgroundColor: '#ff2d2d',
            borderColor: '#ff2d2d',
            borderWidth: 1,
            tension: 0.4,
            fill: false,
            pointRadius: 2
          }
          // {
          //   label: 'Cumulative Mortality',
          //   data: rawList.map((item: any) => Number(item.cumulativeMortality) || 0)
          // }
        ]
      },
    },
    {
      chartTitle: 'Body Weight (gms)',
      type: 'line',
      data: {
        labels: categories,
        datasets: [
          {
            label: 'Standard',
            data: rawList.map((item: any) => Number(item.dailyStdBodyWeightGms) || 0),
            backgroundColor: '#115f13',
            borderColor: '#115f13',
            borderWidth: 1,
            tension: 0.4,
            fill: false,
            pointRadius: 2
          },
          {
            label: 'Actual',
            data: rawList.map((item: any) => Number(item.dailyActualBodyWeightGms) || 0),
            backgroundColor: '#ff2d2d',
            borderColor: '#ff2d2d',
            borderWidth: 1,
            tension: 0.4,
            fill: false,
            pointRadius: 2
          }
        ]
      }
    }];

    return {
      cards,
      farmDetails,
      tabularData,
      chartsData
    };
  }

}
