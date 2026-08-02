import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Utility } from '../../utility/data-store';
import { ApiService } from '../../services/api-service';
import { BatchPerformance } from '../../services/batch-performance';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  userFullName = signal('');
  farmName = signal('');
  batchCode = signal('');
  selectedBatch = signal<any>(null);

  readonly router = inject(Router);

  constructor() {
    let profile = Utility.getProfile();
    let farms = Utility.getFarms();
    let batches = Utility.getBatches();
    this.selectedBatch.set(batches.filter((b: any) => b.isDefaultBatch == true));
    this.userFullName.set(profile?.userFullName);
    this.farmName.set(farms[0]?.farmName);
    this.batchCode.set(this.selectedBatch()[0]?.batchCode);

    // console.log("Username", this.userFullName());
    // console.log("Farms", this.farmName());
    // console.log("selected batch", this.batchCode());
  }


  logout() {
    Utility.clearAll();
    this.router.navigate(['/login']);
  }

}
